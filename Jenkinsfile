// Pipeline deploy Xuân Lộc - chạy trên Jenkins local (thư mục jenkins/)
//   Build 2 image -> push Docker Hub -> SSH vào VPS app kéo image mới -> kiểm tra health
//
// Credentials cần tạo trong Jenkins (Manage Jenkins -> Credentials), xem DEPLOY.md mục 7:
//   dockerhub-login : Username with password  (lam141000 + Docker Hub access token)
//   app-server-ssh  : SSH Username with private key (ubuntu + nội dung develops.pem)
//   app-server-host : Secret text (IP public của VPS app)
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    parameters {
        booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Deploy lên VPS app sau khi push image')
    }

    environment {
        DOCKERHUB_USER = 'lam141000'
        BE_IMAGE = "${DOCKERHUB_USER}/xuanloc-be"
        FE_IMAGE = "${DOCKERHUB_USER}/xuanloc-fe"
    }

    stages {
        stage('Prepare') {
            steps {
                script {
                    // Tag image theo commit để biết bản nào đang chạy
                    env.TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                }
                echo "Building commit ${env.TAG}"
            }
        }

        stage('Build images') {
            parallel {
                stage('Backend') {
                    steps {
                        sh 'docker build -t "$BE_IMAGE:$TAG" -t "$BE_IMAGE:latest" XuanLoc-BE'
                    }
                }
                stage('Frontend') {
                    // Không truyền VITE_API_URL -> dùng URL production trong .env.production
                    steps {
                        sh 'docker build -t "$FE_IMAGE:$TAG" -t "$FE_IMAGE:latest" XuanLoc-FE'
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-login', usernameVariable: 'DH_USER', passwordVariable: 'DH_TOKEN')]) {
                    sh '''
                        echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin
                        docker push "$BE_IMAGE:$TAG"
                        docker push "$BE_IMAGE:latest"
                        docker push "$FE_IMAGE:$TAG"
                        docker push "$FE_IMAGE:latest"
                    '''
                }
            }
            post {
                always {
                    sh 'docker logout || true'
                }
            }
        }

        stage('Deploy') {
            when {
                expression { params.DEPLOY }
            }
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'app-server-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER'),
                    string(credentialsId: 'app-server-host', variable: 'APP_HOST')
                ]) {
                    // Lấy host key mới mỗi lần build (giống GitHub Actions) vì server có thể được tạo lại
                    sh '''
                        ssh-keyscan -H "$APP_HOST" > "$WORKSPACE/known_hosts" 2>/dev/null
                        ssh -i "$SSH_KEY" -o UserKnownHostsFile="$WORKSPACE/known_hosts" "$SSH_USER@$APP_HOST" '
                            set -e
                            cd ~/xuanloc
                            docker compose pull backend frontend
                            docker compose up -d
                            docker image prune -f
                        '
                    '''
                }
            }
        }

        stage('Health check') {
            when {
                expression { params.DEPLOY }
            }
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'app-server-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER'),
                    string(credentialsId: 'app-server-host', variable: 'APP_HOST')
                ]) {
                    sh '''
                        ssh -i "$SSH_KEY" -o UserKnownHostsFile="$WORKSPACE/known_hosts" "$SSH_USER@$APP_HOST" '
                            for i in $(seq 1 20); do
                                if curl -fsS http://127.0.0.1:3069/api/health && curl -fsS -o /dev/null http://127.0.0.1:3000/; then
                                    echo; echo "Backend and frontend are healthy"; exit 0
                                fi
                                sleep 3
                            done
                            echo "Health check failed"; exit 1
                        '
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Deploy thành công commit ${env.TAG}"
        }
        failure {
            echo "Pipeline thất bại - xem log của stage bị đỏ"
        }
    }
}
