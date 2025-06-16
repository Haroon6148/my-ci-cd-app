pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Run App') {
            steps {
                sh 'node app.js'
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
