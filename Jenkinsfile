pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/Haroon6148/my-ci-cd-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install' // Only if you have package.json; remove this line if not needed
            }
        }

        stage('Run App') {
            steps {
                sh 'node app.js'
            }
        }
    }
}
