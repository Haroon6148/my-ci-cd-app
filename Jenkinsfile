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
                nodejs('NodeJS_Auto_Managed') {
                    bat 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                nodejs('NodeJS_Auto_Managed') {
                    bat 'npm test'
                }
            }
        }

        stage('Package') {
            steps {
                powershell 'Remove-Item -Path "app.zip" -ErrorAction SilentlyContinue'
                powershell 'Compress-Archive -Path app.js,package.json,node_modules -DestinationPath app.zip'
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Use a generic withCredentials to get the SSH key content
                    withCredentials([string(credentialsId: env.SSH_KEY_CREDENTIAL_ID, variable: 'SSH_PRIVATE_KEY_CONTENT')]) {
                        // Define a path for the temporary key file
                        def tempKeyFile = "temp_ssh_key.pem"

                        // Write the SSH private key content to a temporary file
                        powershell "Set-Content -Path '${tempKeyFile}' -Value \"${env.SSH_PRIVATE_KEY_CONTENT}\" -Encoding UTF8"

                        // Set strict permissions on the SSH key file for Windows using icacls
                        powershell """
                            $keyPath = \\"${tempKeyFile}\\"
                            # Remove inherited permissions and all explicit ACEs (Access Control Entries)
                            icacls \\$keyPath /inheritance:r
                            # Grant Full control to the current user (Jenkins service account) and SYSTEM
                            icacls \\$keyPath /grant:r \\\"`$env:USERNAME`\\\":(F)\
                            icacls \\$keyPath /grant:r \\\"SYSTEM\\\":(F)\
                            # Explicitly remove permissions for broad groups like \\\'Users\\\', \\\'Everyone\\\', \\\'Authenticated Users\\\'
                            icacls \\$keyPath /remove:g \\\"BUILTIN\\\\Users\\\"\
                            icacls \\$keyPath /remove:g \\\"Everyone\\\"\
                            icacls \\$keyPath /remove:g \\\"Authenticated Users\\\"\
                        """

                        echo "Deploying to EC2 instance: ${env.EC2_IP}"

                        // Stop existing Node.js process (if any)
                        // Use the temporary key file with -i
                        sh "ssh -i ${tempKeyFile} -o StrictHostKeyChecking=no ${env.EC2_USER}@${env.EC2_IP} 'sudo pkill node || true'"

                        // Transfer the application bundle
                        // Use the temporary key file with -i
                        sh "scp -i ${tempKeyFile} -o StrictHostKeyChecking=no app.zip ${env.EC2_USER}@${env.EC2_IP}:/home/${env.EC2_USER}/"

                        // Unzip and start the application on EC2
                        sh """
                            ssh -i ${tempKeyFile} -o StrictHostKeyChecking=no ${env.EC2_USER}@${env.EC2_IP} \'
                                cd /home/${env.EC2_USER}/\
                                unzip -o app.zip\
                                nohup node app.js > app.log 2>&1 &\
                                echo \\\"Application started on port ${env.APP_PORT}\\\"\
                            \'
                        """
                        echo "Deployment initiated. Check EC2 instance logs for status."

                        // Clean up: Delete the temporary key file
                        powershell "Remove-Item -Path '${tempKeyFile}' -Force"
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