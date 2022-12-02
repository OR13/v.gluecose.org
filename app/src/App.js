


import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import AppPage from './AppPage'

import FileUploader from './FileUploader'
import JSONView from './JSONView'

import { green, blue } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import { useEffect, useState } from 'react';

import cose from './services/cose'
import uri from './services/uri'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: blue,
    secondary: green
  }
});

function App() {

  

  const [object, setObject] = useState(null)
  const handleFilesAccepted = async (files) =>{
    const [file] = files;
    console.log(file)
    let cborObject;
    let coseData;
    if (file.type === 'application/json'){
      const content = new TextDecoder().decode(await file.arrayBuffer());
      const testCase = JSON.parse(content)
      if (testCase?.output?.cbor){
        const buf = cose.hexToArrayBuffer(testCase.output.cbor);
        coseData = buf
        cborObject = await cose.loadFromArrayBuffer(buf) 
      }
    }
    if (file.path.endsWith('.cose')){
      const content = await file.arrayBuffer()
      coseData = content
      cborObject = await cose.loadFromArrayBuffer(content) 
    
    }
    setObject(cborObject)
    console.log('cborObject', cborObject)
    await uri.handleUriUpdate(coseData)
  }

  useEffect(()=>{
    if (window.location.hash.startsWith('#pako:')){
     (async ()=>{
      const coseData = await uri.getCoseDataFromFragment(window.location.hash)
      console.log(coseData)
      const cborObject = await cose.loadFromArrayBuffer(coseData) 
      setObject(cborObject)
      console.log('cborObject', cborObject)
     })()
    }
      }, [])
  return (

    <ThemeProvider theme={theme}>
      <ToastContainer position="bottom-right" />
      <AppPage>

        <Typography paragraph>
          This web application provides an easy way to share and view cose object in a "jose like" JSON view.
        </Typography>

        <Typography paragraph>
          You can obtain examples from <Link href="https://github.com/cose-wg/Examples/tree/master/ecdsa-examples">cose-wg/Examples</Link>.
        </Typography>

        <Typography paragraph>
          Currently only COSE_Sign1 is supported.
        </Typography>

        <FileUploader onFilesAccepted={handleFilesAccepted}/>
       
        {object && <Box sx={{mt: 2}}>
          <JSONView value={object} />
        </Box>}
    </AppPage>
    </ThemeProvider>
    
  );
}

export default App;
