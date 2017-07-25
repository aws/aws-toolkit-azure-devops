Trace-VstsEnteringInvocation $MyInvocation
Import-VstsLocStrings "$PSScriptRoot\Task.json"
function Test-AWSPowerShellModuleInstalled($installIfRequired)
{
    Write-Host (Get-VstsLocString -Key "VerifyingAWSPowerShellModuleInstalled")

    $awsModule = Get-Module -ListAvailable | ? { $_.Name -eq 'AWSPowerShell' }
    if (!$awsModule)
    {
        if ($installIfRequired)
        {
            Write-Host (Get-VstsLocString -Key "InstallingModule")
            $installBlockString =
@"
Install-PackageProvider -Name NuGet -Force -Scope CurrentUser -Verbose
Install-Module -Name AWSPowerShell -Force -Scope CurrentUser -Verbose
"@
            $installBlock = [Scriptblock]::Create($installBlockString)
            Invoke-Command -ScriptBlock $installBlock
        }
        else
        {
            throw (Get-VstsLocString -Key "AWSPowerShellModuleNotFound")
        }
    }

    Write-Host (Get-VstsLocString -Key "ModuleInstalled")
}

try
{
    $awsEndpoint = Get-VstsInput -Name 'awsCredentials' -Require
    $awsEndpointAuth = Get-VstsEndpoint -Name $awsEndpoint -Require
    $awsRegion = Get-VstsInput -Name 'regionName' -Require
    $scriptType = Get-VstsInput -Name 'scriptType' -Require
    $arguments = Get-VstsInput -Name arguments
    $installIfRequired = Get-VstsInput -Name 'autoInstallModule' -AsBool

    Test-AWSPowerShellModuleInstalled $installIfRequired

    # set the credentials into the default profile, with region
    Write-Host (Get-VstsLocString -Key "InitializingContext")
    $initParams = @{
        'AccessKey'=$awsEndpointAuth.Auth.Parameters.UserName
        'SecretKey'=$awsEndpointAuth.Auth.Parameters.Password
        'Region'=$awsRegion
    }
    Initialize-AWSDefaultConfiguration @initParams

    # Run the user's command or script. If the user gave us a file, load it
    # into a script block. Prefer this over serializing a script block to
    # disk in case the script contains sensitive material that the user
    # might not expect to be left on the file system (should an error
    # cause clean up failure)
    if ($scriptType -eq 'filePath')
    {
        $scriptFile = Get-VstsInput -Name 'scriptName' -Require
        Test-Path -Path $scriptFile

        $script = Get-Content -Path $scriptFile -Encoding UTF8
    }
    else
    {
        $script = Get-VstsInput -Name 'inlineScript' -Require
    }

    $scriptblock = [Scriptblock]::Create($script)
    Write-Host (Get-VstsLocString -Key "ExecutingScript")
    Invoke-Command -ScriptBlock $scriptblock -ArgumentList $arguments -Verbose
}
finally
{
    Trace-VstsLeavingInvocation $MyInvocation
}
