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
    Assert-VstsAgent -Minimum '2.115.0'

    $tempDirectory = Get-VstsTaskVariable -Name 'agent.tempDirectory' -Require
    Assert-VstsPath -LiteralPath $tempDirectory -PathType 'Container'

    $awsEndpoint = Get-VstsInput -Name 'awsCredentials' -Require
    $awsEndpointAuth = Get-VstsEndpoint -Name $awsEndpoint -Require
    $awsRegion = Get-VstsInput -Name 'regionName' -Require

    # install the module if not present
    Write-Host (Get-VstsLocString -Key 'TestingModuleInstalled')
    if (!(Get-Module -Name AWSPowerShell -ListAvailable))
    {
        Write-Host (Get-VstsLocString -Key 'InstallingModule')
        try
        {
            Install-Module -Name AWSPowerShell -Scope CurrentUser -Verbose -Force
        }
        catch
        {
            Write-Host (Get-VstsLocString -Key 'UsingNugetProvider')
            Install-PackageProvider -Name NuGet -Scope CurrentUser -Verbose -Force
            Install-Module -Name AWSPowerShell -Scope CurrentUser -Verbose -Force
        }
    }

    Write-Host (Get-VstsLocString -Key 'InitializingAWSContext' -ArgumentList $awsRegion)
    Import-Module -Name AWSPowerShell
    Initialize-AWSDefaultConfiguration -AccessKey $awsEndpointAuth.Auth.Parameters.UserName -SecretKey $awsEndpointAuth.Auth.Parameters.Password -Region $awsRegion

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
        # construct a name to a temp file that will hold the inline script, so
        # we can pass arguments to it
        $input_filePath = [System.IO.Path]::Combine($tempDirectory, "$([System.Guid]::NewGuid()).ps1")
    }

    # Generate the script contents
    Write-Host (Get-VstsLocString -Key 'GeneratingScript')
    $contents = @()
    $contents += "`$ErrorActionPreference = '$input_errorActionPreference'"

    # by writing an inline script to a file, and then dot sourcing that from
    # the outer script we construct (ie behaving as if the user had chosen
    # filepath mode) we gain the ability to pass arguments to both modes
    if ("$scriptType".ToUpperInvariant() -eq 'INLINE')
    {
        $userScript += "$input_script".Replace("`r`n", "`n").Replace("`n", "`r`n")
        $joinedContents = [System.String]::Join(([System.Environment]::NewLine), $userScript)
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
    Trace-VstsLeavingInvocation $MyInvocation
}
