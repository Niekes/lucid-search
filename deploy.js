// eslint-disable-next-line import/no-extraneous-dependencies
const FtpDeploy = require('ftp-deploy');

const ftpDeploy = new FtpDeploy();

const config = {
    user: process.env.NIEKES_USER,
    password: process.env.NIEKES_PASSWORD,
    host: process.env.NIEKES_HOST,
    port: 21,
    localRoot: `${__dirname}/dist/`,
    remoteRoot: '/lucid.niekes.com',
    include: ['*', '**/*', '.htaccess'],
    deleteRemote: true, // delete existing files at destination before uploading
    forcePasv: true, // Passive mode is forced (EPSV command is not sent)
};

ftpDeploy.deploy(config)
    .then(() => console.log('Finished!'))
    .catch(err => console.log(err));

ftpDeploy.on('uploading', (data) => {
    console.log(`${(data.transferredFileCount / data.totalFilesCount * 100).toFixed(2)}% transferred -- ${data.filename}`);
});
