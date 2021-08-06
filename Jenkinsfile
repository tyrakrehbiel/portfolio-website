pipeline {
    agent any
    environment {
        REACT_APP_SERVICE_URL = getServiceUrl(BRANCH_NAME)
        REACT_APP_VERSION = "${BUILD_NUMBER}"
        S3_BUCKET = getS3Bucket(BRANCH_NAME)
        JENKINS_BUILD_URL = getBuildUrlLink(BUILD_URL)
        CLOUDFRONT_DIST = getCloudfrontDist(BRANCH_NAME)
        CI = false
    }
    stages {
        stage('Build') {
            when {
                not {
                    anyOf {
                        branch 'master';
                    }
                }
            }
            agent { label 'react-agent' }
            steps {
                container('react-agent') {
                    checkout scm
                    sh 'yarn'
                    sh 'yarn test --coverage --watchAll=false'
                    stash includes: 'coverage/', name: 'COVERAGE'
                }
            }
        }
        stage('Sonar') {
            when {
                not {
                    anyOf {
                        branch 'master';
                    }
                }
            }
            agent { label 'react-agent' }                    
            steps {
                container('react-agent') {
                    withSonarQubeEnv('sonarqube') {
                        sh "yarn"
                        unstash 'COVERAGE'
                        sh "yarn sonar-scanner -Dsonar.login=$SONAR_AUTH_TOKEN"
                    }
                }
            }
        }
        stage('Deploy') {
            when {
                anyOf {
                    branch 'development';
                    branch 'master';
                }
            }            
            agent { label 'react-agent' }         
            steps {
                container('react-agent') {
                    checkout scm
                    sh "yarn"
                    sh 'yarn build'
                }
                container('aws-agent') {
                    sh """aws s3 sync build/ s3://${env.S3_BUCKET}"""
                    sh "aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DIST} --paths '/*'"


                }
            }
        }        
    }
    post {
        failure {
            slackSend(channel: '#life-mappa-slack-notification', color: "danger", message: "Failure *${BRANCH_NAME}*: ${JENKINS_BUILD_URL}")

        }
        success {
            slackSend(channel: '#life-mappa-slack-notification', color: "good", message: "Success: *${BRANCH_NAME}*: ${JENKINS_BUILD_URL}")
        }
    }
}
def getServiceUrl(branch) {
    if ('development'.equals(branch)) 
        return 'lifemappa-backend.dev.deployment.simoncomputing.com'
    else if ('master'.equals(branch)) 
        return 'lifemappa-backend.prd.deployment.simoncomputing.com'
    else 
        return ''
    
}
def getS3Bucket(branch) {
    if ('development'.equals(branch)) 
        return 'life-mappa.dev.deployment.simoncomputing.com'
    else if ('master'.equals(branch)) 
        return 'life-mappa.prd.deployment.simoncomputing.com'
    else
        return ''    
}

def getCloudfrontDist(branch) {
    if ('development'.equals(branch)) {
        return 'EL7OVYXNTI64K' // dev
    } else {
        return 'does not deploy'
    }
}


def getBuildUrlLink(link) {
    return (link.substring(0,8) + "jenkins." + link.substring(8));
}
