--활동테이블
CREATE TABLE `activity` (
  `activityid` varchar(100) NOT NULL,
  `userid` varchar(100) NOT NULL,
  `start_date` varchar(100) DEFAULT NULL,
  `distance` varchar(100) DEFAULT NULL,
  `start_latlng` varchar(100) DEFAULT NULL,
  `end_latlng` varchar(100) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `map` varchar(100) DEFAULT NULL,
  `average_speed` varchar(100) DEFAULT NULL,
  `max_speed` varchar(100) DEFAULT NULL,
  `calories` varchar(100) DEFAULT NULL,
  `elev` varchar(100) DEFAULT NULL,
  `etc` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`activityid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8


--유저테이블
CREATE TABLE `user` (
  `userid` bigint(20) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `sex` varchar(100) DEFAULT NULL,
  `profile` varchar(100) DEFAULT NULL, 
  `clubs` varchar(100) DEFAULT NULL,
  `etc` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
