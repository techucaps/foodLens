import React, { Component } from 'react';
import { Linking, Button, StyleSheet, Text, View } from 'react-native';
import Auth from '@aws-amplify/auth';
import Analytics from '@aws-amplify/analytics';

import awsconfig from './src/aws-exports';
Amplify.configure(aws_exports);

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);
// send analytics events to Amazon Pinpoint
Analytics.configure(awsconfig);

export default class App extends Component {
    constructor(props) {
      super(props);
      this.handleAnalyticsClick = this.handleAnalyticsClick.bind(this);
      this.state = {
        resultHtml: <Text></Text>,
        eventsSent: 0
      };
    }

    handleAnalyticsClick() {
      const { aws_project_region, aws_mobile_analytics_app_id } = awsconfig;

      Analytics.record('AWS Amplify Tutorial Event')
        .then( (evt) => {
            const url = `https://${aws_project_region}.console.aws.amazon.com/pinpoint/home/?region=${aws_project_region}#/apps/${aws_mobile_analytics_app_id}/analytics/events`;
            const result = (
              <View>
                <Text>Event Submitted.</Text>
                <Text>Events sent: {this.state.eventsSent + 1}</Text>
                <Text style={styles.link} onPress={() => Linking.openURL(url)}>
                  View Events on the Amazon Pinpoint Console
                </Text>
              </View>
            );
            this.setState({
                resultHtml: result,
                eventsSent: this.state.eventsSent + 1
            });
        });
    };

    render() {
      return (
        <View style={styles.container}>
          <Text>Welcome to your React Native App with Amplify!</Text>
          <Button title="Generate Analytics Event" onPress={this.handleAnalyticsClick} />
          {this.state.resultHtml}
        </View>
      );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    color: 'blue'
  }
});