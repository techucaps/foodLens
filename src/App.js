
import React, { Component } from "react";
import Camera, { IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import Loader from "react-loader-spinner";
import Popup from "reactjs-popup";
//import './BoundingBox.js';
import "./App.css";
import './Camera.css';
import "./Emojicon";

  
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemInfo: [],
      fishclass: "",
      confidence: "",
      loading: false,
      cameraOn: true,
      image: false,
      key: "",
      upload: false,
      dataUri: "",
      prediction: false
    };  
  }


  getBase64(file, cb) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      cb(reader.result);
    };
    reader.onerror = function(error) {
      console.log("Error: ", error);
    };
  }

  showCamera = e => {
    this.setState({
      cameraOn: true,
      image: false,
      loading: false,
      fishclass: "",
      confidence: "",
      dataUri: "",
      key: ""
    });
  };

  onTakePhoto(dataUri) {
    const savedImage = dataUri.split(",")[1];
    fetch(
      /* API endpoint here */ "https://50xlesnkqe.execute-api.us-east-1.amazonaws.com/foodLens-deploy1/index",
      {
        method: "POST",
        body: JSON.stringify({ payload : savedImage })
      }
    )
      .then(response => response.json())
      .then(data =>
        this.setState({
          key: data.key,
          cameraOn: false,
          loading: true,
          dataUri: dataUri
        })
      )
      .catch(err => console.log(err));

      
  }

  state = { isOpen: false };

  handleShowDialog = () => {
    this.setState({ isOpen: !this.state.isOpen });
    console.log('clicked');
  };

  // async predictFish(url, options, n) {
  //   try {
  //     const response = await fetch(url, options);
  //     const data = await response.json();
  //     let fishclass = data.class.split("'")[1].replace(/_/g, " ");
  //     let confidence = String(data.confidence * 100).substring(0, 5) + "%";
  //     this.setState({
  //       image: true,
  //       loading: false,
  //       fishclass: fishclass,
  //       confidence: confidence,
  //       upload: false,
  //       prediction: true
  //     });
  //   } catch (err) {
  //     if (n === 1) throw err;
  //     return await this.predictFish(url, options, (n = 1));
  //   }
  // }

  handleUpload = event => {
    if (this.uploadInput.files[0]) {
      let file = this.uploadInput.files[0];
      this.getBase64(file, result => {
       fetch(
         /* S3 endpoint here */ "https://50xlesnkqe.execute-api.us-east-1.amazonaws.com/foodLens-deploy1/index",
          {
            method: "POST",
            headers: {
              //"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
              //'Access-Control-Allow-Origin': "*"
            },
            body: JSON.stringify({ payload : result.split(",")[1] })
          }
        )
          .then(response => response.json())
          .then(data =>
            this.setState({
              key: data.key,
              cameraOn: false,
              image: false,
              dataUri: result,
              loading: true,
              message: "UPLOAD AN IMAGE"
            })
          )
          .catch(err => console.log(err));  
      });
    } else {
      return null;
    }
  };

  handleChange = e => {
    if (this.uploadInput.files[0]) {
      let file = this.uploadInput.files[0];
      this.getBase64(file, result => {
        this.setState({
          dataUri: result,
          cameraOn: false,
          image: true,
          prediction: false
        });
      });
    }
  };


  

  
  render() {
    return (
      
      <div className="App">
        <center>
          <div className="wizard">
            <h1>FOODLENS 🧐</h1>
 
           {/*  {this.state.loading
              ? setTimeout(() => {
                  this.predictFish(  invoke endpoint URL 
                    "",
                    {
                      //method: "POST",
                      headers: {
                        //"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                        //'Access-Control-Allow-Origin': "*"
                      },
                       body: JSON.stringify({ 
                        url:
                         "" + 
                          this.state.key
                      }) 
                    }
                  );
                }, 2500)
              : null} */}
            {this.state.loading ? (
              <Loader type="Grid" color="#008080" height="80" width="80" />
            ) : null }
            {this.state.image ? (
              <div className="prediction">
                <img
                  className="fishImg"
                  src={this.state.dataUri}
                  alt="uploaded pic of fish"
                  onClick={this.handleShowDialog}

                />
                {this.state.prediction ? (
                  <div>
                    {parseFloat(this.state.confidence) > 85 ? (
                      <div className="prediction">
                        <p>
                          This is a <span>{this.state.result}</span> 
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p>We were unable to identify this fish. Please try again.</p>
                      </div>
                    )}
                    <button className="openCamera" onClick={this.showCamera}>
                      Wanna take more photos?
                    </button>
                  </div>
                ) : null}
                 <p>
                  This is a {" "}
                  <span>{this.state.payload}</span>
                </p>
                <button className="openCamera" onClick={this.showCamera}>
                  Take another photo!
                </button> 
              
              </div>
            ) : null}
            {this.state.cameraOn ? (
              <div className="camera">
                <Camera
                  imageType={IMAGE_TYPES.JPG}
                  idealResolution={{ width: 2160, height: 1440 }}
                  onTakePhoto={dataUri => {
                    this.onTakePhoto(dataUri);
                  }}
                />
              </div>
              
            ) : null}
            {this.state.loading ? null : (
              <div className="uploader">
                <input
                  className="inputfile"
                  id="inputfile"
                  name="input"
                  ref={ref => {
                    this.uploadInput = ref;
                  }}
                  onChange={this.handleChange}
                  type="file"
                  accept="image/jpeg"
                />
                <label htmlFor="inputfile">
                  UPLOAD <span role="img"></span>
                </label>
                <button className="uploadButton" onClick={this.handleUpload}>
                  TEST
                </button>
              </div>
            )}
          </div>
        </center>
      </div>
    );
  }
}
export default App;