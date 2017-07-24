Trace-VstsEnteringInvocation $MyInvocation
Import-VstsLocStrings "$PSScriptRoot\Task.json"
function Test-AWSPowerShellModuleInstalled($installIfRequired)
{
    Write-VstsTaskVerbose (Get-VstsLocString -Key "VerifyingAWSPowerShellModuleInstalled")

    $awsModule = Get-Module -ListAvailable | ? { $_.Name -eq 'AWSPowerShell' }
    if (!$awsModule)
    {
        if ($installIfRequired)
        {
            Write-VstsTaskVerbose (Get-VstsLocString -Key "InstallingModule")

            Invoke-Command -ScriptBlock {Install-PackageProvider -Name NuGet -Force -Scope CurrentUser; Install-Module -Name AWSPowerShell -Force -Verbose -Scope CurrentUser}
        }
        else
        {
            throw (Get-VstsLocString -Key "AWSPowerShellModuleNotFound")
        }
    }
}

try
{
    $awsEndpoint = Get-VstsInput -Name 'awsCredentials' -Require
    $awsEndpointAuth = Get-VstsEndpoint -Name $awsEndpoint -Require
    $awsRegion = Get-VstsInput -Name 'regionName' -Require
    $scriptType = Get-VstsInput -Name 'scriptType' -Require
    $arguments = Get-VstsInput -Name arguments
    $installIfRequired = Get-VstsInput -Name 'installModuleIfRequired' -AsBool

    Test-AWSPowerShellModuleInstalled $installIfRequired

    Write-VstsTaskVerbose (Get-VstsLocString -Key "ImportingModule")
    Import-Module -Name AWSPowerShell

    # set the credentials into the default profile, with region
    Write-VstsTaskVerbose (Get-VstsLocString -Key "InitializingContext")
    $initParams = @{
        'AccessKey'=$awsEndpointAuth.Auth.Parameters.UserName
        'SecretKey'=$awsEndpointAuth.Auth.Parameters.Password
        'Region'=$awsRegion
    }
    Initialize-AWSDefaultConfiguration @initParams

    # run the user's command or script
    if ($scriptType -eq 'inlineScript')
    {
        $script = Get-VstsInput -Name 'inlineScript' -Require
        $scriptblock = [scriptblock]::Create($script)
        Write-Host "Scriptblock = $scriptblock"
        Invoke-Command -ScriptBlock $scriptblock -ArgumentList $arguments -Verbose
    }
    else
    {
        Invoke-Command -FilePath (Get-VstsInput -Name scriptName -Require) -ArgumentList $arguments -Verbose
    }
}
finally
{
    Trace-VstsLeavingInvocation $MyInvocation
}
