const nock = require('nock');

after(function(){
	nock.cleanAll();
	nock.enableNetConnect();
});
