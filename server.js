
//v.1.0


//----------------------------------------
//---------배포/개발용 구분--------------------
//1. mysql 커넥션
//2. 주소사용부분은 호스팅 도메인으로 변경 (view페이지도)
//3. 경로 못잡는 문제로사용
//app.set('views', __dirname + '/views');
//app.set('public', __dirname + '/public');

//---------------모듈정의--------------------
var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var express = require('express');
var session = require('express-session');
var querystring = require('querystring');
var mysql = require('mysql');
var jsts = require('jsts');
//---------------------------------------
//---------------변수 및 사용관련-------------------
var app = express();
var sess = '';

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

//배포용
/*
var connection = initializeConnection({
    host: '10.0.0.1',
	post: 3306,
	user: 'snowgoodman',
	password: 'snowman157248!',
	database: 'snowgoodman'
});
*/


//개발용
 var connection = mysql.createConnection({
        host: 'localhost',
        post: 3306,
        user: 'root',
        password: '1q2w!!',
        //password: 'root',
        database: 'snowgoodman'
    });
connection.connect();


//배포시 커넥션 끊어지는 문제로 추가
function initializeConnection(config) {
    function addDisconnectHandler(connection) {
        connection.on("error", function (error) {
            if (error instanceof Error) {
                if (error.code === "PROTOCOL_CONNECTION_LOST") {
                    console.error(error.stack);
                    console.log("Lost connection. Reconnecting...");

                    initializeConnection(connection.config);
                } else if (error.fatal) {
                    throw error;
                }
            }
        });
    }

    var connection = mysql.createConnection(config);

    // Add handlers.
    addDisconnectHandler(connection);

    connection.connect();
    return connection;
}

function sessionCheck(){
	if(sess.userId === '' || sess.userId == undefined || sess.userId === 'undefined' || sess.userId === 'null' || sess.userId == null){
		//console.log('-------------세션정보가 없습니다----------------');
		//res.send('<h1> 연결이 끊겼습니다. 다시 로그인 하세요. !</h1><script>window.location.replace("' + '/index' + '");</script>');
		return false;
	}else{
		return true;
	}
}

	
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
app.set('views', __dirname + '/views');
app.set('public', __dirname + '/public');
app.engine('html', require('ejs').renderFile);

   
//---------------------------------------

 
//--------------라우터---------------------
 //index
 app.get('/index',function(req,res){
	if(sessionCheck()){
		indexPageLoad(req, res);
	}else{
		res.render('index.html'); 
	}
	  
 });
 
 //rank
 app.get('/myrecord',function(req,res){
	if(sessionCheck()){
		recordPageLoad(req, res);
	}else{
		res.render('index.html');
	}
	  
 });
 
 
  //index
 app.get('/rank',function(req,res){
	if(sessionCheck()){
		rankPageLoad(req, res);
	}else{
		res.render('index.html');
	}
	  
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
	athleteOptions.headers.Authorization = 'Bearer ' + sess.access_token;
	console.log(athleteOptions);
	
	//운동선수 데이터
	getAthleteData(req, res);
});



//---------------------- DB 컨트롤 -----------------------------------
//활동 update
app.get('/activityDataUpdating', function(req, res){
	var databody = req.query.dataBody;
	updateActivityData(req, res, databody);
});


//운동선수 update
app.get('/athleteDataUpdating', function(req, res){
	var databody = req.query.dataBody;
	updateAthleteData(req, res, databody);
});

//일단은 거리별 사용자별 토탈랭킹
app.get('/getDistanceRank', function(req, res){
	//var databody = req.query.dataBody;
	getDistanceRankData(req, res);
});


app.get('/getMyRecordData',function(req,res){
	getMyRecordData(req, res);
});


app.get('/getMyRank',function(req,res){
	getMyRankData(req, res);
});


app.get('/getTotalDistRank',function(req,res){
	getTotalDistRank(req, res);
});


app.get('/getMaxSpeedRank',function(req,res){
	getMaxSpeedRank(req, res);
});


app.get('/getWeekRecordData',function(req,res){
	getWeekRecordData(req, res);
});



//동적파일 서비스------------------------------------------------------------
app.get('/actionIndex', function(req, res){
  if(sess.userId != undefined && sess.userId != ''){
	  indexPageLoad(req, res);
  }else{
	  res.render('index.html');
  }
  
	
});
//동적파일 서비스---------------------


//-------------라우터----------------------
	

//--------------------펑션---------------------------


function commonHeaderControl(type, url, req, res){
	
	//변수들
	
	var userId = sess.userId;
	var userName = sess.userName;
	var profilePic = sess.profilePic;
	var city = sess.city;
	var sex = sess.sex;
	var clubs = sess.clubs;
	//동적생성을 위한 변수
	var dynamicContent = '';
	
	fs.readFile(url, function (err, data) {
      if (err) {
         console.log(err);
      }else{
		 console.log("파일읽기성공 -200-" + dynamicContent.toString());
		 dynamicContent = data.toString();
		 var output = dynamicContent.toString().replace('#userLine#', '<img src=' + profilePic + ' id="profile_img" class="img-circle" alt="Cinque Terre" style="width=50px; height:50px; border-radius:50%;"><span style="color:black !important; margin-left:12px; margin-top:12px;">안녕하세요' + userId + '(' + userName + ')님</span>');
		 var output2 = output.toString().replace('#authVal#', '1');
		 
		 if(type == 'myrecord'){
			var totalstr = userId + '|';
			totalstr += userName + '|';
			totalstr += profilePic + '|';
			totalstr += city + '|';
			totalstr += sex + '|';
			totalstr += clubs + '|';
			
			console.log(totalstr);
		
			output2 = output2.toString().replace('#profileVal#', totalstr);
		 }
		 res.send(output2);
      }
   });
	
}


function indexPageLoad(req, res){
	commonHeaderControl('index', __dirname + '/views/index.html', req, res);
	// 자바스크립트 새로운 표준 formatted text 기능
	// ` `(grave accent) 사용을 통해서 JS에서 여려줄의 코드를 넣을 수 없는 문제를 해결
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

}

function recordPageLoad(req, res){
	commonHeaderControl('myrecord', __dirname + '/views/myrecord.html', req, res);
}


function rankPageLoad(req, res){
	commonHeaderControl('rank', __dirname + '/views/rank.html', req, res);
}

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

//------------------------db작업-------------------------------------------------

//활동db저장
function updateActivityData(req, res, databody){	
	var msg = 'success';
	for(var i=0; i< databody.length; ++i){
		var activityId = databody[i].id;
		//console.log(activityId);
		var athleteId = databody[i].athlete.id;
		var start_date = databody[i].start_date;
		var distance = databody[i].distance;
		var startLatlng = databody[i].start_latlng;
		console.log('startLatlng' + startLatlng);
		var endLatlng = databody[i].end_latlng;
		var type = databody[i].type;
		var map = '';
		var averageSpeed = databody[i].average_speed;
		var maxSpeed = databody[i].max_speed;
		var elev = databody[i].elev_high; //최고고도?
		var calories = databody[i].calories;
		
		
		var sql = 'insert into activity(activity_id, athlete_id, state_date, distance, start_latlng, end_latlng, type, map, average_speed, max_speed, elev, calories, etc) values(?)';
		var values = [activityId, athleteId, start_date, distance, '', '', type, map, averageSpeed, maxSpeed, elev, calories, i];
		//['232','','','','','','','','','','','',''];
		
		if (1 == 1) {
			connection.query(sql, [values], function (err, rows, fields) {
				if (!err) {
					//res.send('success');
					console.log('updateActivityData ------- success');
				} else {
					//res.send('err : ' + err);
					msg += '업데이트실패 : ' + err;
					console.log('updateActivityData ------- err : ' + err);
				}
			});
		}
	}
	res.send(msg);
}


//운동선수db저장
function updateAthleteData(req, res, databody){
	var msg = 'success';
	
	//console.log(databody);
	var id = databody.id;
	var username = databody.username;
	var firstname = databody.firstname;
	var lastname = databody.lastname;
	var city = databody.city;
	var state = databody.state;
	var sex = databody.sex;
	var profile = databody.profile;
	var clubs = databody.clubs;
	var etc = '';
	
	
	var sql = 'insert into user(id, username, firstname, lastname, city, state, sex, profile, clubs, etc) values(?)';
	var values = [id, username, firstname, lastname, city, state, sex, profile, clubs, etc];

	
	if (1 == 1) {
		connection.query(sql, [values], function (err, rows, fields) {
			if (!err) {
				console.log('updateAthleteData ------- success');
				//res.send('success');
			} else {
				//res.send('err : ' + err);
				msg += '업데이트실패 : ' + err;
				console.log('updateAthleteData ------- err : ' + err);
			}
		});
	}
	res.send(msg);
	
}

//거리별 사용자별 랭킹 조회
function getDistanceRankData(req, res){

	var sql = `SELECT SUM(A.distance) as dist, B.id, B.username, B.city, B.profile, B.clubs
				FROM activity A 
				LEFT OUTER JOIN user B
				ON A.athlete_id = B.id
				GROUP BY B.id, B.username
				ORDER BY MAX(A.distance) DESC
				LIMIT 10;`;
	if (1 == 1) {
		connection.query(sql, function (err, rows, fields) {
			if (!err) {
				console.log('getDistanceRankData ------- success');
				//res.send('success');
				res.send(rows);
			} else {
				console.log('getDistanceRankData ------- err : ' + err);
				res.send('err : ' + err);
			}
		});
	}
	
}

function getMyRecordData(req, res){
	
	var sql = `SELECT activity_id, athlete_id, state_date, distance, type, average_speed, max_speed, elev, calories
				FROM activity
				WHERE athlete_id = '?';`;
				
	var userId = sess.userId;
					
	if (1 == 1) {
		connection.query(sql, userId, function (err, rows, fields) {
			if (!err) {
				//res.send('success');
				console.log('getMyRecordData ------- success');
				res.send(rows);
			} else {
				res.send('err : ' + err);
				console.log('getMyRecordData ------- err : ' + err);
			}
		});
	}
}



function getMyRankData(req, res){
	var whereVal = [sess.userId, sess.userId];
	var sql = `(SELECT AA.*, '거리' as etc FROM
				(select @rownum1:=@rownum1+1 as rk, b.* from
				(select a.athlete_id, sum(a.distance*1) as dist
				from activity a
				group by a.athlete_id
				) b, (select @rownum1:=0) TMP
				order by b.dist desc) AA
			where AA.athlete_id = '?')
			union all
			(select AA.*, '속도' as etc from
				(select  @rownum2:=@rownum2+1 as rk, b.* from 
				(select a.athlete_id, max(a.max_speed*1) as speed
				from activity a
				group by a.athlete_id
				) b, (select @rownum2:=0) TMP
				order by b.speed desc) AA
			where AA.athlete_id = '?')`;
			
	if (1 == 1) {
		connection.query(sql, whereVal, function (err, rows, fields) {
			if (!err) {
				console.log('getMyRankData ------- success');
				res.send(rows);
			} else {
				res.send('err : ' + err);
			}
		});
	}
}


function getTotalDistRank(req, res){
	
	var sql = `select @rownum:=@rownum+1 as rk, b.* from
				(select a.athlete_id, u.username, u.city, u.profile, u.clubs, sum(a.distance*1) as dist
				from activity a LEFT OUTER JOIN user u
				ON a.athlete_id = u.id
				group by a.athlete_id, u.username, u.city, u.profile, u.clubs
				) b, (select @rownum:=0) TMP
				order by b.dist desc
				limit 10;`;
				
	var userId = sess.userId;
					
	if (1 == 1) {
		connection.query(sql, function (err, rows, fields) {
			if (!err) {
				//res.send('success');
				console.log('getTotalDistRank ------- success');
				res.send(rows);
			} else {
				res.send('err : ' + err);
			}
		});
	}
	
}

function getMaxSpeedRank(req, res){
	
	var sql = `select  @rownum:=@rownum+1 as rk, b.* from 
				(select a.athlete_id, u.username, u.city, u.profile, u.clubs, max(a.max_speed*1) as speed
				from activity a LEFT OUTER JOIN user u
				ON a.athlete_id = u.id
				group by a.athlete_id, u.username, u.city, u.profile, u.clubs
				) b, (select @rownum:=0) TMP
				order by b.speed desc
				limit 10;`;
				
	var userId = sess.userId;
					
	if (1 == 1) {
		connection.query(sql, function (err, rows, fields) {
			if (!err) {
				//res.send('success');
				console.log('getMaxSpeedRank ------- success');
				res.send(rows);
			} else {
				res.send('err : ' + err);
				console.log('getMaxSpeedRank err ------- err');
			}
		});
	}
}


function getWeekRecordData(req, res){
	var userId = sess.userId;//AA.state_date, AA.week, AA.athlete_id
	var sql = `select count(AA.week) as weekcnt, AA.week
				from
					(SELECT state_date, DAYOFWEEK(state_date) AS week_n,
					CASE DAYOFWEEK(state_date)
						WHEN '1' THEN '일요일'
						WHEN '2' THEN '월요일'
						WHEN '3' THEN '화요일'
						WHEN '4' THEN '수요일'
						WHEN '5' THEN '목요일'
						WHEN '6' THEN '금요일'
						WHEN '7' THEN '토요일'
					END AS week , athlete_id
					FROM activity
					WHERE athlete_id = '?') AA
				group by AA.week
				`;
					
	if (1 == 1) {
		connection.query(sql, userId, function (err, rows, fields) {
			if (!err) {
				//res.send('success');
				console.log('getWeekRecordData ------- success');
				res.send(rows);
			} else {
				res.send('err : ' + err);
				console.log('getWeekRecordData err ------- err');
			}
		});
	}
	
}



//핸들링
function handleResponse(response, req, res, type) {
  var serverData = '';
  
  response.on('error', (err) => {
    console.error(err);
  });
  response.on('data', function (chunk) { //스트림
    console.log(chunk.toString());
	serverData += chunk;
  });
  response.on('end', function () { 
    console.log("received server data:");
	
	if(type === 'auth'){
		
		var jsonContent = JSON.parse(serverData);
		//console.log('jsonContent:' + jsonContent.toString());
		
		//세션값 세팅
		sess = req.session;	
		sess.access_token = jsonContent.access_token;
		sess.refresh_token = jsonContent.refresh_token;
		sess.userId = jsonContent.athlete.id;
		sess.userName = jsonContent.athlete.username;
		sess.profilePic = jsonContent.athlete.profile;
		sess.city = jsonContent.athlete.city;
		sess.sex = jsonContent.athlete.sex;
		sess.clubs = jsonContent.athlete.clubs;
		
		//console.log('sess--------------------- : ' + sess);
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

//개발용 
var server = app.listen(8080, function(){
// 배포용 
//var server = app.listen(8001, function(){
	    console.log("------- server has started --------")
});
