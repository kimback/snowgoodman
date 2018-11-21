//---------------모듈정의--------------------
var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var express = require('express');
var session = require('express-session');
var querystring = require('querystring');
//---------------------------------------
//---------------변수 및 사용관련-------------------
var app = express();
var sess = '';

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

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


//라우터 및 뷰 엔진설정
//var router = require('./router/main')(app, querystring);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

   
//---------------------------------------

 
//--------------라우터---------------------
 //index
 app.get('/index',function(req,res){
	res.render('index.html');
 });
 
//인증1
app.get('/*auth1result*', function(req, res){
	console.log('-------------auth1result-----------');
	console.log(req.query); //인증받은값
	
	var postData = '';
	postData = querystring.stringify({
	'client_id' : '29632', //개발단id
	'client_secret' : '1ea7a6e9fc6933ce50addb2eedbdca22b30500ed', //개발단pw
	'code' : req.query.code,
	'grant_type' : 'authorization_code'
	});
		
	console.log(postData);
	//인증2
	requestAuth2(req, res, postData);
	
});


//활동조회
app.get('/getActivity', function(req, res){
	console.log('-------------getActivity-----------');
	
	//해더 완성
	activityOptions.headers.Authorization = 'Bearer ' + sess.access_token;
	console.log(activityOptions);
	
	//파라미터완성
	var postData = '';
	postData = querystring.stringify({
		'id' : sess.userId,
		'include_all_efforts' : ''
	});
	
	//활동 데이터
	getActivityData(req, res, postData);
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



//동적파일 서비스---------------------
app.get('/actionIndex', function(req, res){
  //var lis = '';
  //for(var i = 0; i <5; i++){
      //lis += '<li>coding ' + i + '</li>';
  //}
  
  // 자바스크립트 새로운 표준 formatted text 기능
  // ` `(grave accent) 사용을 통해서 JS에서 여려줄의 코드를 넣을 수 없는 문제를 해결
  
	var userId = sess.userId;
	var userName = sess.userName;
	var dynamicContent = '';
	
	fs.readFile('./views/index.html', function (err, data) {
      if (err) {
         console.log(err);
      }else{
		 console.log("200" + dynamicContent.toString());
		 dynamicContent = data.toString();
		 var output = dynamicContent.toString().replace('#userLine#', '<span>안녕하세요' + userId + '(' + userName + ')님</span>');
		 var output2 = output.toString().replace('#authVal#', '1'
		 /*
		 `<script type="text/javascript">
			var colorNames = Object.keys(window.chartColors);
		 
			$.get("/getActivity", function(data, status){
				alert("Data: " + data + "Status: " + status);
				var jsonContent = JSON.parse(data);
				
				var colorName = colorNames[config.data.datasets.length % colorNames.length];
				var newColor = window.chartColors[colorName];
				var newDataset = {
					label: '날짜별데이터',
					backgroundColor: newColor,
					borderColor: newColor,
					data: [],
					fill: false
				};
				
				//라벨 x축
				for(var i=0; i<jsonContent.length; ++i){
					config.data.labels.push(formatDate(jsonContent[i].start_date));
				}
				
				//데이터 y축
				for (var index = 0; index < config.data.labels.length; ++index) {
					newDataset.data.push(randomScalingFactor());
				}
				config.data.datasets.push(newDataset);
				window.myLine.update();
				
			});
			
			$.get("/getAthlete", function(data, status){
				alert("Data: " + data + "Status: " + status);
				var jsonContent = JSON.parse(data);
			});
		 </script>`
		 */
		 );
		 res.send(output2);
		 
		 //체인성 작업 서버에서 진행
		 //dataRefreshAndUpdate(req, res);
      }
   });
	
});
//동적파일 서비스---------------------


//-------------라우터----------------------
	

//--------------------펑션---------------------------

//인증2
function requestAuth2(req, res, postData){
	var httpsRequest = https.request(authOptions, function(response){//콜백
		console.log('-------------auth2-----------');
		handleResponse(response, req, res, 'auth');
	});
	httpsRequest.write(postData);
	httpsRequest.end();//http call execute
}

//필요 데이터 리플레쉬 & 업데이트
//필요정보를 조회하고 데이터를 서버에 업데이트 한다.
function dataRefreshAndUpdate(req, res){
	startGetActivity(req, res);
	startGetAthleteData(req, res);
}

//활동조회 시작
function startGetActivity(req, res){
	console.log('-------------getActivity-----------');
	
	//해더 완성
	activityOptions.headers.Authorization = 'Bearer ' + sess.access_token;
	console.log(activityOptions);
	
	//파라미터완성
	var postData = '';
	postData = querystring.stringify({
		'id' : sess.userId,
		'include_all_efforts' : ''
	});
	
	//운동선수 데이터
	getActivityData(req, res, postData);
	
}

//활동 조회 (토큰만으로 조회함)
function getActivityData(req, res, postData){
	var httpsRequest = https.request(activityOptions, function(response){//콜백
		console.log('-------------getActivityData-----------');
		handleResponse(response, req, res, 'activity');
	});
	httpsRequest.write(postData);
	httpsRequest.end();//http call execute
	
}

function startGetAthleteData(req, res){
	console.log('-------------getAthlete-----------');
	//console.log('-------------sess.access_token-----------' + sess.access_token);
	athleteOptions.headers.Authorization = 'Bearer ' + sess.access_token;
	console.log(athleteOptions);
	
	//운동선수 데이터
	getAthleteData(req, res);
	
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
		
		var jsonContent = JSON.parse(serverData);
		console.log(jsonContent);
		
		//세션값 세팅
		sess = req.session;	
		sess.access_token = jsonContent.access_token;
		sess.refresh_token = jsonContent.refresh_token;
		sess.userId = jsonContent.athlete.id;
		sess.userName = jsonContent.athlete.username;
		sess.profilePic = jsonContent.athlete.profile;
		
		console.log(sess);
		res.send('<h1>strava connected !</h1><script>window.location.replace("' + './actionIndex' + '");</script>');
		
	}else if(type === 'athlete'){
		//DB에 저장하는 로직 필요
		//...
		console.log(serverData);
		res.send(serverData.toString());
	}else if(type === 'activity'){
		//DB에 저장하는 로직 필요
		//...
		console.log(serverData.toString());
		res.send(serverData.toString());
	}
	
  });
}


//-----------------------------------------------

var server = app.listen(8080, function(){
    console.log("Express server has started on port 8080")
});
