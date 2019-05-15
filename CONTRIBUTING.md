# Contributing Guidelines

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional
documentation, we greatly value feedback and contributions from our community.

Please read through this document before submitting any issues or pull requests to ensure we have all the necessary
information to effectively respond to your bug report or contribution.

## Reporting Bugs/Feature Requests

We welcome you to use the GitHub issue tracker to report bugs or suggest features.

When filing an issue, please check [existing open](https://github.com/aws/aws-vsts-tools/issues), or [recently closed](https://github.com/aws/aws-vsts-tools/issues?q=is%3Aissue+is%3Aclosed), issues to make sure somebody else hasn't already
reported the issue. Please try to include as much information as you can. Details like these are incredibly useful:

-   A reproducible test case or series of steps
-   Your version of VSTS (if known) and if it is hosted or in house
-   Anything unusual about your environment

## Building

1. Clone the repo or your fork with `git clone`
2. Change to the directory you cloned to, and run `npm install`
3. At this point you can:
  - Build for testing purposes. Run `npm run fullBuild`
  - Package for installation into VSTS. Run `npm run fullBuild publisher=<your-publisher-id-here>` VSTS uses this publisher ID to determine if a plugin can be installed, so make sure it matches the one in your VSTS instance.

## Contributing via Pull Requests

Contributions via pull requests are much appreciated. Before sending us a pull request, please ensure that:

1. You are working against the latest source on the master branch.
2. You check existing open, and recently merged, pull requests to make sure someone else hasn't addressed the problem already.
3. You open an issue to discuss any significant work - we would hate for your time to be wasted.

To send us a pull request, please:

1. Fork the repository.
2. Modify the source; please focus on the specific change you are contributing. Please follow the instructions in building to install the hook for prettier to make sure your code is formatted like the repo.
3. Ensure local tests pass.
4. Make sure to add tests to your change
5. Commit to your fork using clear commit messages.
6. Send us a pull request, answering any default questions in the pull request interface.
7. Pay attention to any automated CI failures reported in the pull request, and stay involved in the conversation.

GitHub provides additional documentation on [forking a repository](https://help.github.com/articles/fork-a-repo/) and
[creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

## Testing locally

We are still working out a good way to do this beyond writing tests. 

If you have a test VSTS server, you can upload the packaged plugin from "\_package". Keep in mind that VSTS expects you to bump the version number (located in \_versioninfo.json) every time you upload a new plugin, as well as that your pulibsher ID matches the publisher ID of the plugin already on the server.

## Finding contributions to work on

Looking at the existing issues is a great way to find something to contribute on. Looking at any ['help wanted'](https://github.com/aws/aws-toolkit-jetbrains/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) issues is a great place to start.

## Code of Conduct

This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct).
For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact
[opensource-codeofconduct@amazon.com](mailto:opensource-codeofconduct@amazon.com) with any additional questions or comments.

## Licensing

See the [LICENSE](LICENSE) file for our project's licensing. We will ask you confirm the licensing of your contribution.

We may ask you to sign a [Contributor License Agreement (CLA)](http://en.wikipedia.org/wiki/Contributor_License_Agreement) for larger changes.
