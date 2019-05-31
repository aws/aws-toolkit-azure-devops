#!/bin/bash

DELETED_FIELDS=(
    'metrics'
    '_links'
    'authoredBy'
    'retentionRules'
    'queue'
    'triggers'
    'tags'
    'properties'
    'url'
    'uri'
    'createdDate'
    'project.id'
    'project.url'
    'project.revision'
    'project.visability'
    'repository.url'
    'variables.bundleBucket'
    'variables.bucketName'
    'variables.bundleBucketName'
    'variables.topicArn'
    'variables.queueUrl'
)

which jq || ( echo "jq is not installed, on OSX you can get this from 'brew install jq'" && exit 1 )

echo "This script cleans up exported tasks to remove undesirable fields"
echo
echo "it will be run on the following files:"
for file in *.json;
do 
    echo ${file}
done
echo

read -p "Look over the list then press enter to continue, this will modify every .json file listed above!"
read -p "Are you really sure?"

for file in *.json;
do 
    echo "fixing up file ${file}"
    OUTPUT=$(jq -M . $file)
    for field in "${DELETED_FIELDS[@]}";
    do 
        OUTPUT=$(jq -M "del(.${field})" <<< "$OUTPUT")
    done
    OUTPUT=$(jq . -M <<< "$OUTPUT")
    echo $OUTPUT > $file
done

echo "done"
