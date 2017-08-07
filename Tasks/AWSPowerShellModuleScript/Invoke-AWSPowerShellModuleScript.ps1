##########################################################################
# Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
#
# Licensed under the MIT License. See the LICENSE accompanying this file
# for the specific language governing permissions and limitations under
# the License.
##########################################################################

Trace-VstsEnteringInvocation $MyInvocation
Import-VstsLocStrings "$PSScriptRoot\Task.json"
function Test-AWSPowerShellModuleInstalled($installIfRequired)
{
    try
    {
        if (!($PSVersionTable.PSEdition -eq "Desktop"))
        {
            Write-Host (Get-VstsLocString -Key "IncompatiblePowerShellEditionFound")
        }
        else
        {
            Write-Host (Get-VstsLocString -Key "CompatiblePowerShellEditionFound")
        }

        Write-Host (Get-VstsLocString -Key "VerifyingAWSPowerShellModuleInstalled")

        $awsModule = Get-Module -ListAvailable | ? { $_.Name -eq 'AWSPowerShell' }
        if (!$awsModule)
        {
            if ($installIfRequired)
            {
                Write-Host (Get-VstsLocString -Key "InstallingModule")
                Install-PackageProvider -Name NuGet -Force -Scope CurrentUser -Verbose
                Install-Module -Name AWSPowerShell -Force -Scope CurrentUser -Verbose
            }
            else
            {
                throw (Get-VstsLocString -Key "AWSPowerShellModuleNotFound")
            }
        }

        Write-Host (Get-VstsLocString -Key "ModuleInstalled")
    }
    catch
    {
            Write-Host (Get-VstsLocString -Key "ErrorCheckingModuleInstall")
    }
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
    $scriptblock.Invoke($arguments)
}
finally
{
    Trace-VstsLeavingInvocation $MyInvocation
}
