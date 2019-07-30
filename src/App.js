import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import React, { Component } from "react";
import Camera, { IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import Loader from "react-loader-spinner";
import "./App.css";
import './Camera.css';
import "./Emojicon";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
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

videoRef = React.createRef();
canvasRef = React.createRef();

componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user"
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  };

  renderPredictions = predictions => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];

      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };

  render() {
    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="600"
          height="500"
        />
        <canvas
          className="size"
          ref={this.canvasRef}
          width="600"
          height="500"
        />
      </div>
    );
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
        body: JSON.stringify({ payload : savedImage})
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

  async predictFish(url, options, n) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      let fishclass = data.class.split("'")[1].replace(/_/g, " ");
      let confidence = String(data.confidence * 100).substring(0, 5) + "%";
      this.setState({
        image: true,
        loading: false,
        fishclass: fishclass,
        confidence: confidence,
        upload: false,
        prediction: true
      });
    } catch (err) {
      if (n === 1) throw err;
      return await this.predictFish(url, options, (n = 1));
    }
  }

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
          .then(response => console.log(response.json()))
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
            <h1>FOODLENS</h1>
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
              <Loader type="Puff" color="#FFfFFF" height="200" width="200" />
            ) : null}
            {this.state.image ? (
              <div className="prediction">
                <img
                  className="fishImg"
                  src={this.state.dataUri}
                  alt="uploaded pic of fish"
                />
                {this.state.prediction ? (
                  <div>
                    {parseFloat(this.state.confidence) > 85 ? (
                      <div className="prediction">
                        <p>
                          I'm <span>{this.state.confidence}</span> these are{" "}
                          <span>{this.state.fishclass}</span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p>We were unable to identify this fish. Please try again.</p>
                      </div>
                    )}
                    <button className="openCamera" onClick={this.showCamera}>
                      Take more photos
                    </button>
                  </div>
                ) : null}
                {/* <p>
                  I'm <span>{this.state.confidence}</span> these are{" "}
                  <span>{this.state.shoeclass}</span>
                </p>
                <button className="openCamera" onClick={this.showCamera}>
                  Take another photo!
                </button> */}
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