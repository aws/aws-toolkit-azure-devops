import { CloudFormation } from 'aws-sdk'
import { TaskOperations } from './src/tasks/CloudFormationExecuteChangeSet/TaskOperations'
import { TaskParameters } from './src/tasks/CloudFormationExecuteChangeSet/TaskParameters'
import { emptyConnectionParameters } from './tests/taskTests/testCommon'

async function test() {
    console.log('In test')
    const cloudFormation = new CloudFormation()

    const defaultTaskParameters: TaskParameters = {
        awsConnectionParameters: emptyConnectionParameters,
        changeSetName: '',
        stackName: '',
        outputVariable: '',
        captureStackOutputs: '',
        captureAsSecuredVars: false
    }

    console.log('Creating TaskOperations')
    const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)

    console.log('Calling TaskOperations.execute')
    await taskOperations.execute()
}

test()
