// Jenkinsfile
pipeline {
    agent any

    environment {
        AWS_REGION = 'eu-north-1' // Your EC2 instance is in Europe (Stockholm)
        EC2_IP = '16.171.25.139' // Your EC2 Public IPv4 address
        EC2_USER = 'ubuntu' // Assuming you chose Ubuntu AMI
        SSH_KEY_CREDENTIAL_ID = 'jenkins-ec2-ssh-key' // The ID you gave your SSH key in Jenkins
        APP_PORT = 3000 // Port your Node.js app runs on
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Haroon6148/my-ci-cd-app.git'
            }
        }

        stage('Build') {
            steps {
                nodejs('NodeJS_Local_Install') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                nodejs('NodeJS_Local_Install') {
                    sh 'npm test'
                }
            }
        }

        stage('Package') {
            steps {
                sh 'zip -r app.zip app.js package.json node_modules'
            }
        }

        stage('Deploy') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: env.SSH_KEY_CREDENTIAL_ID, keyFileVariable: 'SSH_KEY')]) {
                        echo "Deploying to EC2 instance: ${env.EC2_IP}"

                        // Stop existing Node.js process (if any)
                        sh "ssh -i \${SSH_KEY} -o StrictHostKeyChecking=no ${env.EC2_USER}@${env.EC2_IP} 'sudo pkill node || true'"

                        // Transfer the application bundle
                        sh "scp -i \${SSH_KEY} -o StrictHostKeyChecking=no app.zip ${env.EC2_USER}@${env.EC2_IP}:/home/${env.EC2_USER}/"

                        // Unzip and start the application on EC2
                        sh """
                            ssh -i \${SSH_KEY} -o StrictHostKeyChecking=no ${env.EC2_USER}@${env.EC2_IP} '
                                cd /home/${env.EC2_USER}/
                                unzip -o app.zip
                                nohup node app.js > app.log 2>&1 &
                                echo "Application started on port ${env.APP_PORT}"
                            '
                        """
                        echo "Deployment initiated. Check EC2 instance logs for status."
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline job finished.'
        }
        success {
            echo 'Pipeline succeeded! Application deployed.'
        }
        failure {
            echo 'Pipeline failed! Check console output for errors.'
        }
    }
}