const docentList = require('../../db/model/siteList')
const galleryData = require('../../db/model/galleryData')
const exhibitionData = require('../../db/model/exhibitionData')
const calDistance = require('../../moduels/calDistance')

const mysql = require('../../lib/dbConnection')
const dbpool = require('../../../config/connection')
const decodeTokenFunc = require('../../lib/token')

exports.getListSite = async (req, res) => {
  let gallerySiteDataResult, userNearGalleryDataResult, totalExDataResult, nearExDataResult = []
  const connection = await mysql(dbpool)
  try {
    const { latitude, longitude } = req.query

    
    gallerySiteDataResult = await galleryData.getGalleryLatLngInfo(connection)
    userNearGalleryDataResult = calDistance(latitude, longitude, gallerySiteDataResult)
    // userNearDataResult = await docentList.siteList(latitude, longitude, connection)
    if(userNearGalleryDataResult.length != 0) {
      totalExDataResult = await exhibitionData.getAllExInfo(connection)
      for(i in userNearGalleryDataResult) {
        for(j in totalExDataResult) {
          if(userNearGalleryDataResult[i].gallery_id == totalExDataResult[j].gallery_id) {
            nearExDataResult.push({
              ex_id : totalExDataResult[j].ex_id,
              ex_image : totalExDataResult[j].ex_image,
              ex_title : totalExDataResult[j].ex_title,
              gallery_name : gallerySiteDataResult[i].gallery_name
            })
          }
        }
      }
    }
  } catch (e) {
    connection.release()
    res.status(500).send({
      status: 'fail',
      code: 6001,
      message: e,
    })
    return
  }
  connection.release()
  res.status(200).send({
    status: 'success',
    code: 6000,
    message: 'success get site list',
    data: nearExDataResult,
  })
}


exports.getListFavor = async (req, res) => {
  let userFavorDataResult
  const connection = await mysql(dbpool)
  try {
    //*****************************************************************
    //토큰 사용시
    const { user_token } = req.headers
    const decodedTokenResult = await decodeTokenFunc.decodedToken(user_token, req.app.get('jwt-secret'))
    const userId = decodedTokenResult.userID
    //******************************************************************

    userFavorDataResult = await docentList.favorList(userId, connection)
  } catch (e) {
    connection.release()
    res.status(500).send({
      status: 'fail',
      code: 6002,
      message: e,
    })
    return
  }
  connection.release()
  res.status(200).send({
    status: 'success',
    code: 6000,
    message: 'success get listfavor',
    data: userFavorDataResult
  })
}

//도슨트 트랙리스트
exports.getListGuide = async (req, res) => {
  let docentDataResult,Result
  const connection = await mysql(dbpool)
  try {
    const { exId } = req.query

    /*마감일<현재날짜  --> 마감된 전시
      시작일>현재날짜 --> 준비주인 전시
    */
    docentDataResult = await docentList.guideList(exId, connection)

    if(docentDataResult.length===0){
      Result = await exhibitionData.DateData(exId,connection)
    }else{
      Result = 1
    }
  } catch (e) {
    connection.release()
    res.status(500).send({
      status: 'fail',
      code: 6003,
      message: e,
    })
    return
  }
  connection.release()
  res.status(200).send({
    status: 'success',
    code: 6000,
    message: 'Guidelist select success',
    data: {
      'ex_state' : Result,
      docentDataResult
    }
  })
}

