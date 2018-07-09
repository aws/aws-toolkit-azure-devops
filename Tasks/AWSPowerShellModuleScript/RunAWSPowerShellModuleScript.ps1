##########################################################################
# Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
#
# Licensed under the MIT License. See the LICENSE accompanying this file
# for the specific language governing permissions and limitations under
# the License.
##########################################################################

[CmdletBinding()]
param()

Trace-VstsEnteringInvocation $MyInvocation
Import-VstsLocStrings "$PSScriptRoot\task.json"

# Adapting code from the VSTS-Tasks 'PowerShell' task to install (if needed)
# and set up the executing context for AWS, then handing the user script
# off to PowerShell for execution
try
{
    # Agent.TempDirectory was added in agent version 2.115.0, which may not
    # be available in 2015 installs of TFS, so probe for and fallback to
    # another temp location variable if necessary. This allows us to set
    # minimunm agent version that's compatible with TFS 2015 editions
    # preventing an issue causing our tasks to not be listed after install
    # if a higher agent version is specified.
    $tempDirectory = Get-VstsTaskVariable -Name 'agent.tempDirectory'
    if (!$tempDirectory)
    {
        Write-Host 'Agent.TempDirectory not available, falling back to user temp location'
        $tempDirectory = $env:TEMP
    }

    Assert-VstsPath -LiteralPath $tempDirectory -PathType 'Container'

    # install the module if not present (we assume if present it is an an autoload-capable
    # location)
    Write-Host (Get-VstsLocString -Key 'TestingModuleInstalled')
    $manualImportPath = $null
    if (!(Get-Module -Name AWSPowerShell -ListAvailable))
    {
        Write-Host (Get-VstsLocString -Key 'InstallingModule')
        # Use Save-Module, to a temp folder, over Install-Module which currently has a
        # long output-less lag once the module has downloaded.
        # See https://github.com/aws/aws-vsts-tools/issues/51
        try
        {
            # Install-Module -Name AWSPowerShell -Scope CurrentUser -Verbose -Force
            Save-Module -Name AWSPowerShell -Path $tempDirectory -Verbose
        }
        catch
        {
            Write-Host (Get-VstsLocString -Key 'UsingNugetProvider')
            Install-PackageProvider -Name NuGet -Scope CurrentUser -Verbose -Force
            # Install-Module -Name AWSPowerShell -Scope CurrentUser -Verbose -Force
            Save-Module -Name AWSPowerShell -Path $tempDirectory -Verbose
        }

        # figure out the actual path to import from, allowing for the possibility of multiple versions
        # being left around due to a prior accident
        $moduleVersionFolder = Get-ChildItem -Path (Join-Path $tempDirectory 'AWSPowerShell') |
            Sort-Object -Property Name -Descending |
            Select-Object -First 1
        $manualImportPath = [IO.Path]::Combine($tempDirectory, 'AWSPowerShell', $moduleVersionFolder, 'AWSPowerShell.psd1')
    }

    if ($manualImportPath)
    {
        Write-Host (Get-VstsLocString -Key 'ImportingModuleFrom' -ArgumentList $manualImportPath)
        Import-Module $manualImportPath
    }
    else
    {
        Import-Module -Name AWSPowerShell
    }

    # If credentials and/or region are not defined on the task we assume them to be
    # already set in the host environment or, if on EC2, to be in instance metadata.
    # We prefer to use environment variables to pass credentials, to avoid leaving
    # any profiles around when the build completes and any contention from parallel
    # or multi-user build setups.
    $awsEndpoint = Get-VstsInput -Name 'awsCredentials'
    if ($awsEndpoint)
    {
        $awsEndpointAuth = Get-VstsEndpoint -Name $awsEndpoint -Require
        if ($awsEndpointAuth.Auth.Parameters.AssumeRoleArn)
        {
            Write-Host (Get-VstsLocString -Key 'ConfiguringForRoleCredentials')
            $assumeRoleParameters = @{
                'AccessKey' = $awsEndpointAuth.Auth.Parameters.UserName
                'SecretKey' = $awsEndpointAuth.Auth.Parameters.Password
                'RoleArn' = $awsEndpointAuth.Auth.Parameters.AssumeRoleArn
            }
            if ($awsEndpointAuth.Auth.Parameters.RoleSessionName)
            {
                $assumeRoleParameters.Add('RoleSessionName', $awsEndpointAuth.Auth.Parameters.RoleSessionName)
            }
            else
            {
                $assumeRoleParameters.Add('RoleSessionName', 'aws-vsts-tools')
            }
            if ($awsEndpointAuth.Auth.Parameters.ExternalId)
            {
                $assumeRoleParameters.Add('ExternalId', $awsEndpointAuth.Auth.Parameters.ExternalId)
            }

            $assumeRoleResponse = Use-STSRole @assumeRoleParameters

            $env:AWS_ACCESS_KEY_ID = $assumeRoleResponse.Credentials.AccessKeyId
            $env:AWS_SECRET_ACCESS_KEY = $assumeRoleResponse.Credentials.SecretAccessKey
            $env:AWS_SESSION_TOKEN = $assumeRoleResponse.Credentials.SessionToken
        }
        else
        {
            $env:AWS_ACCESS_KEY_ID = $awsEndpointAuth.Auth.Parameters.UserName
            $env:AWS_SECRET_ACCESS_KEY = $awsEndpointAuth.Auth.Parameters.Password
        }
    }

    $awsRegion = Get-VstsInput -Name 'regionName'
    if ($awsRegion)
    {
        Write-Host (Get-VstsLocString -Key 'InitializingAWSContext' -ArgumentList $awsRegion)
        $env:AWS_REGION = $awsRegion
    }

    # Was not able to get the Get-VstsWebProxy helper to work, plus it has a
    # minimum agent version of 2.105.8 so instead we attempt to read the Agent.Proxy*
    # variables directly
    $agentProxyUrl = Get-VstsTaskVariable -Name 'Agent.ProxyUrl'
    $agentProxyUserName = Get-VstsTaskVariable -Name 'Agent.ProxyUsername';
    $agentProxyPassword = Get-VstsTaskVariable -Name 'Agent.ProxyPassword';

    # poke metrics tag into the environment
    Set-Item -Path env:AWS_EXECUTION_ENV -Value 'VSTS-AWSPowerShellModuleScript'

    $scriptType = Get-VstsInput -Name 'scriptType' -Require
    $input_errorActionPreference = Get-VstsInput -Name 'errorActionPreference' -Default 'Stop'
    switch ($input_errorActionPreference.ToUpperInvariant())
    {
        'STOP' { }
        'CONTINUE' { }
        'SILENTLYCONTINUE' { }
        default
        {
            Write-Error (Get-VstsLocString -Key 'PS_InvalidErrorActionPreference' -ArgumentList $input_errorActionPreference)
        }
    }

    $input_failOnStderr = Get-VstsInput -Name 'failOnStderr' -AsBool
    $input_ignoreLASTEXITCODE = Get-VstsInput -Name 'ignoreLASTEXITCODE' -AsBool
    $input_workingDirectory = Get-VstsInput -Name 'workingDirectory' -Require
    Assert-VstsPath -LiteralPath $input_workingDirectory -PathType 'Container'

    $scriptType = Get-VstsInput -Name 'scriptType' -Require
    $input_arguments = Get-VstsInput -Name 'arguments'

    if ("$scriptType".ToUpperInvariant() -eq "FILEPATH")
    {
        $input_filePath = Get-VstsInput -Name 'filePath' -Require
        try
        {
            Assert-VstsPath -LiteralPath $input_filePath -PathType Leaf
        }
        catch
        {
            Write-Error (Get-VstsLocString -Key 'PS_InvalidFilePath' -ArgumentList $input_filePath)
        }

        if (!$input_filePath.ToUpperInvariant().EndsWith('.PS1'))
        {
            Write-Error (Get-VstsLocString -Key 'PS_InvalidFilePath' -ArgumentList $input_filePath)
        }
    }
    else
    {
        $input_script = Get-VstsInput -Name 'inlineScript' -Require
        # Construct a name to a temp file that will hold the inline script, so
        # we can pass arguments to it. We will delete this file on exit from
        # the task.
        $input_filePath = [System.IO.Path]::Combine($tempDirectory, "$([System.Guid]::NewGuid()).ps1")
    }

    # Generate the script contents
    Write-Host (Get-VstsLocString -Key 'GeneratingScript')
    $contents = @()
    $contents += "`$ErrorActionPreference = '$input_errorActionPreference'"

    if ($agentProxyUrl)
    {
        $proxyUri = [Uri]$agentProxyUrl

        $proxyCommand = "Set-AWSProxy"
        $proxyCommand += " -Hostname $($proxyUri.Host)"
        $proxyCommand += " -Port $($proxyUri.Port)"

        if ($agentProxyUserName)
        {
            $proxyCommand += " -Username $agentProxyUserName"
        }
        if ($agentProxyPassword)
        {
            $proxyCommand += " -Password $agentProxyPassword"
        }

        Write-Host "Configuring script for proxy at $($proxyUri.Scheme)://$($proxyUri.Host):$($proxyUri.Port)"

        $contents += $proxyCommand
    }

    # By writing an inline script to a file, and then dot sourcing that from
    # the outer script we construct (ie behaving as if the user had chosen
    # filepath mode) we gain the ability to pass arguments to both modes.
    # We don't need to clean this file up on exit.
    if ("$scriptType".ToUpperInvariant() -eq 'INLINE')
    {
        $userScript += "$input_script".Replace("`r`n", "`n").Replace("`n", "`r`n")
        $joinedContents = [System.String]::Join(([System.Environment]::NewLine), $userScript)
        Write-Host "Writing inline script to temporary file $input_filePath"
        $null = [System.IO.File]::WriteAllText($input_filePath, $joinedContents, ([System.Text.Encoding]::UTF8))
    }

    $contents += ". '$("$input_filePath".Replace("'", "''"))' $input_arguments".Trim()

    Write-Host (Get-VstsLocString -Key 'PS_FormattedCommand' -ArgumentList ($contents[-1]))

    if (!$input_ignoreLASTEXITCODE)
    {
        $contents += 'if (!(Test-Path -LiteralPath variable:\LASTEXITCODE)) {'
        $contents += '    Write-Host ''##vso[task.debug]$LASTEXITCODE is not set.'''
        $contents += '} else {'
        $contents += '    Write-Host (''##vso[task.debug]$LASTEXITCODE: {0}'' -f $LASTEXITCODE)'
        $contents += '    exit $LASTEXITCODE'
        $contents += '}'
    }

    # Write the outer script dot-sourcing the user script which is now temporarily stored
    # in another script file (if it was provided inline) or in the original file the user
    # configured the task with
    $filePath = [System.IO.Path]::Combine($tempDirectory, "$([System.Guid]::NewGuid()).ps1")
    $joinedContents = [System.String]::Join(([System.Environment]::NewLine), $contents)
    Write-Host "Writing temporary wrapper script for invoking user script to $filePath"
    $null = [System.IO.File]::WriteAllText($filePath, $joinedContents, ([System.Text.Encoding]::UTF8))

    # Prepare the external command values.
    $powershellPath = Get-Command -Name powershell.exe -CommandType Application | Select-Object -First 1 -ExpandProperty Path
    Assert-VstsPath -LiteralPath $powershellPath -PathType 'Leaf'
    $arguments = "-NoLogo -NoProfile -NonInteractive -ExecutionPolicy Unrestricted -File `"$filePath`""
    $splat = @{
        'FileName' = $powershellPath
        'Arguments' = $arguments
        'WorkingDirectory' = $input_workingDirectory
    }

    # Switch to "Continue".
    $global:ErrorActionPreference = 'Continue'
    $failed = $false

    # Run the script.
    if (!$input_failOnStderr)
    {
        Invoke-VstsTool @splat
    }
    else
    {
        $inError = $false
        $errorLines = New-Object System.Text.StringBuilder
        Invoke-VstsTool @splat 2>&1 |
            ForEach-Object {
                if ($_ -is [System.Management.Automation.ErrorRecord])
                {
                    # Buffer the error lines.
                    $failed = $true
                    $inError = $true
                    $null = $errorLines.AppendLine("$($_.Exception.Message)")

                    # Write to verbose to mitigate if the process hangs.
                    Write-Verbose "STDERR: $($_.Exception.Message)"
                }
                else
                {
                    # Flush the error buffer.
                    if ($inError)
                    {
                        $inError = $false
                        $message = $errorLines.ToString().Trim()
                        $null = $errorLines.Clear()
                        if ($message)
                        {
                            Write-VstsTaskError -Message $message
                        }
                    }

                    Write-Host "$_"
                }
            }

        # Flush the error buffer one last time.
        if ($inError)
        {
            $inError = $false
            $message = $errorLines.ToString().Trim()
            $null = $errorLines.Clear()
            if ($message)
            {
                Write-VstsTaskError -Message $message
            }
        }
    }

    # Fail on $LASTEXITCODE
    if (!(Test-Path -LiteralPath 'variable:\LASTEXITCODE'))
    {
        $failed = $true
        Write-Verbose "Unable to determine exit code"
        Write-VstsTaskError -Message (Get-VstsLocString -Key 'PS_UnableToDetermineExitCode')
    }
    else
    {
        if ($LASTEXITCODE -ne 0)
        {
            $failed = $true
            Write-VstsTaskError -Message (Get-VstsLocString -Key 'PS_ExitCode' -ArgumentList $LASTEXITCODE)
        }
    }

    # Fail if any errors.
    if ($failed)
    {
        Write-VstsSetResult -Result 'Failed' -Message "Error detected" -DoNotThrow
    }
}
finally
{
    if ($scriptType -And "$scriptType".ToUpperInvariant() -eq "INLINE")
    {
        Write-Host "Cleaning up temporary script file $input_filePath"
        Remove-Item -Path $input_filePath -Force
    }

    Trace-VstsLeavingInvocation $MyInvocation
}
