def label = "tbpim-${UUID.randomUUID().toString()}"

podTemplate(label: label, containers: [
  containerTemplate(name: 'node', image: 'node:8.14', ttyEnabled: true, command: 'cat')
  ]) {

  node(label) {
    stage('Build') {
      checkout scm
      container('node') {
        sh 'npm install'
      }
    }
    stage('Archive') {
      zip archive: true, zipFile: 'tbpim-ct-functions.zip'
    }
    stage('Upload to bucket') {
      googleStorageUpload bucket: 'gs://toryburch-pim-functions', 
      credentialsId: 'toryburch-pim-dev-cloudfunctions-sa', 
      pattern: '*.zip'
    }
  }
}
