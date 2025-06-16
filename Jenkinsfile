pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Kill Previous App (if any)') {
            steps {
                sh '''
                    if lsof -i:3000; then
                        echo "⚠️ Port 3000 is in use. Killing process..."
                        fuser -k 3000/tcp
                    else
                        echo "✅ Port 3000 is free."
                    fi
                '''
            }
        }

        stage('Run App') {
            steps {
                sh 'node app.js &'
            }
        }
    }

    post {
        success {
            echo '✅ Build and run completed successfully.'
        }
        failure {
            echo '❌ Build failed.'
        }
    }
}
