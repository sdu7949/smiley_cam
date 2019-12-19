import React from 'react';
import { ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
// import {Camera} from "expo";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import styled from "styled-components";
import { MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

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
  state = {
    hasPermission: null,
    cameraType: Camera.Constants.Type.front
  };
  componentDidMount = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === "granted") {
      this.setState({ hasPermission: true });
    } else {
      this.setState({ hasPermission: false });
    }
  };
  render() {
    const { hasPermission, cameraType } = this.state;
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
      })
    }
  }
}
