pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "gowthamcd/planora-frontend"
        VERSION = "1.0.${BUILD_NUMBER}"
    }
    stages {
        stage('Cleanup') {
            steps {
                sh 'rm -rf dist' // Clean old builds
            }
        }
        stage('Build Image') {
            steps {
                // Build the image using the Dockerfile in the repo
                sh "docker build -t ${DOCKER_IMAGE}:${VERSION} ."
                sh "docker tag ${DOCKER_IMAGE}:${VERSION} ${DOCKER_IMAGE}:latest"
            }
        }
        stage('Push to Registry') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:${VERSION}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }
        stage('Deploy') {
            steps {
                // Stop the old container and start the new one
                sh "docker stop planora-container || true"
                sh "docker rm planora-container || true"
                sh "docker run -d --name planora-container -p 3000:80 ${DOCKER_IMAGE}:latest"
            }
        }
    }
    post {
        always {
            sh 'docker logout'
        }
    }
}