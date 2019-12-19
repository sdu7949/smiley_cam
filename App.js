import React from 'react';
import { ActivityIndicator, Dimensions, TouchableOpacity, Platform } from 'react-native';
// import {Camera} from "expo";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import styled from "styled-components";
import { MaterialIcons } from "@expo/vector-icons";
import * as FaceDetector from 'expo-face-detector';
import * as MediaLibrary from 'expo-media-library';

const { width, height } = Dimensions.get("window");

const ALBUM_NAME = "Smiley Cam";

const CenterView = styled.View`
  flex:1;
  align-items : center;
  justify-content : center;
  background-color : cornflowerblue;
`;

const Text = styled.Text`
  color:white;
  font-size : 22px;
`;

const IconBar = styled.View`
  margin-top : 50px;
`;

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      hasPermission : null,
      cameraType: Camera.Constants.Type.front,  //카메라의 앞 뒤 타입을 담아두는 변수.
    smileDetected : false                       //스마일 수치를 캐치하는 변수. 기본적으로 false
    };
    this.cameraRef = React.createRef();
  }

  componentDidMount = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);   //카메라를 사용 할 수 있도록 승인 안드로이드에서 승인받는 과정
    if (status === "granted") {
      this.setState({ hasPermission: true });
    } else {
      this.setState({ hasPermission: false });
    }
  };
  render() {
    const { hasPermission, cameraType, smileDetected } = this.state;
    if (hasPermission === true) {
      return (
        <CenterView>
          <Camera
            style={{
              width: width - 40,
              height: height / 1.5,
              borderRadius: 10,
              overflow: "hidden"
            }}
            type={cameraType}
            onFacesDetected={smileDetected ? null : this.onFacesDetected}
            faceDetectorSettings={{
              detectLandmarks: FaceDetector.Constants.Landmarks.all,
              runClassifications: FaceDetector.Constants.Classifications.all
            }}
            ref={this.cameraRef}
          />

          <IconBar>
            <TouchableOpacity onPress={this.switchCameraType}>

              <MaterialIcons name={
                cameraType === Camera.Constants.Type.front ? "camera-rear" : "camera-front"
              }
                color="white"
                size={50}
              />
            </TouchableOpacity>
          </IconBar>

        </CenterView>
      );
    } else if (hasPermission === false) {
      return (
        <CenterView>
          <Text>Don't have permission for this</Text>
        </CenterView>
      );
    } else {
      return (
        <CenterView>
          <ActivityIndicator />
        </CenterView>
      )
    }

  }

  switchCameraType= ()=>{
    const {cameraType} = this.state;
    if(cameraType === Camera.Constants.Type.front){
      this.setState({
        cameraType : Camera.Constants.Type.back
      })
    }else{
      this.setState({
        cameraType : Camera.Constants.Type.front
      });
    }
  };

  onFacesDetected= ({faces}) =>{
    const face = faces[0];
    if(face){
      if(face.smilingProbability > 0.7){
        this.setState({
          smileDetected:true
        });
        this.takePhoto();
      }
    }
  }

  takePhoto = async () => {
    try {
      if (this.cameraRef.current) {
        let { uri } = await this.cameraRef.current.takePictureAsync({
          quality: 1
        });
        if (uri) {
          this.savePhoto(uri);
        }
      }
    } catch (error) {
      alert(error);
      this.setState({
        smileDetected: false
      });
    }
  };

  savePhoto = async uri => {
    try{
      const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      if(status === "granted"){
        const asset = await MediaLibrary.createAssetAsync(uri);
        let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME); 
        if(album === null){
          album = await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset);
        }else{
          await MediaLibrary.addAssetsToAlbumAsync([asset], album.id);
        }
        setTimeout(
          () =>
            this.setState({
              smileDetected: false
            }),
          2000
        );
      }else{
        this.setState({hasPermission : false});
      }
    }catch(error){
      console.log(error);
    }
  }

}
