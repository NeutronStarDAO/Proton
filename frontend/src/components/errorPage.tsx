import React from 'react';
import { Button, Result } from 'antd';


function backHome() {

}

const ErrorPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={<Button type="primary" onClick={backHome} >Back Home</Button>}
    style={{
      height: '100vh',
    }}
  />
);

export default ErrorPage;