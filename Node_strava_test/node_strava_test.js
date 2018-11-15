
//---------------모듈정의--------------------
var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var express = require('express');
var session = require('express-session');
var querystring = require('querystring');

//---------------사용변수정의--------------------

var app = express(); 
var sess = '';
var postData = '';

//세션객체생성
app.use(session({
 secret: '@#@$MYSIGN#@$#$',
 resave: false,
 saveUninitialized: true
}));

//auth2에서 사용
var authOptions = {
	  hostname: 'www.strava.com',
	  port: 443,
	  path: '/oauth/token',
	  method: 'POST',
	  headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
     }
  };
  
  
//운동선수조회에서 사용
var athleteOptions = {
	  hostname: 'www.strava.com',
	  port: 443,
	  path: '/api/v3/athlete',
	  method: 'GET',
	  headers: {
     }
};


//활동정보조회에서 사용
var activityOptions = {
	  hostname: 'www.strava.com',
	  port: 443,
	  path: '/api/v3/activities',
	  method: 'GET',
	  headers: {
     }
};
//-------------라우터----------------------------------




//------------ 화면단 ------------------------------
//초기 인덱스진입
app.get('/index', function(req, res){
	console.log('-------------index-----------');
	sess = req.session;
	
	//이런식으로 정적 HTML 파일 로드함
    fs.readFile('./views/strava_test.html', 'utf8', function(err, text){
        res.send(text);
    });
});

//인증후 액션화면
app.get('/action', function(req, res){
	console.log('-------------action-----------');
	
    fs.readFile('./views/strava_action.html', 'utf8', function(err, text){
        res.send(text);
    });
});





//------------- api 콜 -----------------------

//주의 : 아래의 res 와 response는 주체가 다른 객체임.

//활동조회
app.get('/getActivity', function(req, res){
	console.log('-------------getActivity-----------');
	
	//해더 완성
	activityOptions.headers.Authorization = 'Bearer ' + sess.access_token;
	console.log(activityOptions);
	
	//파라미터완성
	postData = '';
	postData = querystring.stringify({
		'id' : sess.userId,
		'include_all_efforts' : ''
	});
	
	//운동선수 데이터
	getActivityData(req, res);
});

//운동선수
app.get('/getAthlete', function(req, res){
	console.log('-------------getAthlete-----------');
	//console.log('-------------sess.access_token-----------' + sess.access_token);
	athleteOptions.headers.Authorization = 'Bearer ' + sess.access_token;
	console.log(athleteOptions);
	
	//운동선수 데이터
	getAthleteData(req, res);
});

//인증1
app.get('/*auth1result*', function(req, res){
	console.log('-------------auth1result-----------');
	console.log(req.query); //인증받은값
	
	postData = querystring.stringify({
    'client_id' : '29632',
	'client_secret' : '1ea7a6e9fc6933ce50addb2eedbdca22b30500ed',
	'code' : req.query.code,
	'grant_type' : 'authorization_code'
	});
		
	console.log(postData);
		
	//인증2
	requestAuth2(req, res);
	
});


//운동선수 조회 (토큰만으로 조회함)
function getActivityData(req, res){
	var httpsRequest = https.request(activityOptions, function(response){//콜백
		console.log('-------------getActivityData-----------');
		handleResponse(response, req, res, 'activity');
	});
	httpsRequest.write(postData);
	httpsRequest.end();//http call execute
	
}

//운동선수 조회 (토큰만으로 조회함)
function getAthleteData(req, res){
	var httpsRequest = https.request(athleteOptions, function(response){//콜백
		console.log('-------------getAthleteData-----------');
		handleResponse(response, req, res, 'athlete');
	});
	httpsRequest.write('');
	httpsRequest.end();//http call execute
	
}

//인증2
function requestAuth2(req, res){
	var httpsRequest = https.request(authOptions, function(response){//콜백
		console.log('-------------auth2-----------');
		handleResponse(response, req, res, 'auth');
	});
	httpsRequest.write(postData);
	httpsRequest.end();//http call execute
}

//핸들링
function handleResponse(response, req, res, type) {
  var serverData = '';
  
  response.on('error', (err) => {
    console.error(err);
  });
  response.on('data', function (chunk) { //스트림
    serverData += chunk;
  });
  response.on('end', function () { 
    console.log("received server data:");
	
	if(type === 'auth'){
		res.send('<h1>strava connected !</h1><script>window.location.replace("' + './action' + '");</script>');
		var jsonContent = JSON.parse(serverData);
		console.log(jsonContent);
		
		sess = req.session;	
		sess.access_token = jsonContent.access_token;
		sess.refresh_token = jsonContent.refresh_token;
		sess.userId = jsonContent.athlete.id;
		sess.userName = jsonContent.athlete.username;
		sess.profilePic = jsonContent.athlete.profile;
		
		console.log(sess);
	}else if(type === 'athlete'){
		res.send(serverData);
	}else if(type === 'activity'){
		res.send(serverData);
	}
	
  });
}


app.listen(8080, function(){
    console.log('-------------Conneted 8080 port!-----------');
});

