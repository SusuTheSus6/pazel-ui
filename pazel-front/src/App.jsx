import { useEffect, useState } from 'react';
import './App.css'
import { Button } from 'antd';
import ImageGrid from './ImageGrid';
import ShowResult from './ShowResult';

function normalizeData(allDataSelected) {

}

const SERVER = 'http://127.0.0.1:5004'
const BATCH_SUBMIT_ENDPOINT = 'batch-submit'
const GET_ALL_STEPS_ENDPOINT = "all-steps"
function App() {

  const [step, setStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [allSelected, setAllSelected] = useState([])
  const [images, setImages] = useState([])

  async function getAllImages() {
    const run_id = window.location.pathname.replace("/", "")
    if(!run_id) {
      throw Error("Missing run_id")
    }

    const response = await fetch(`${SERVER}/${GET_ALL_STEPS_ENDPOINT}?run_id=` + run_id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(e => e.json());
    const _images = response.files;
    setImages(_images)
  }

  useEffect(() => {
    getAllImages()
  }, [])

  function nextBatch(updatedBatch) {
    if(step < images.length) {
      setStep(oldVal => oldVal + 1)
    }
    if(step === images.length) {
      const run_id = window.location.pathname.replace("/", "")
      setIsFinished(true)
      console.log("This is what we are sending to the backend!", updatedBatch)
      sendFinishToServer({
        steps: updatedBatch,
        run_id
      })
    }
  }

  async function sendFinishToServer(data) {
    try {
      const response = await fetch(`${SERVER}/${BATCH_SUBMIT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Batch Create Result:', result);
      return result; // Return the server response
    } catch (error) {
      console.error('Error during batch creation:', error);
      throw error; // Re-throw the error to handle it in the calling code
    }
  }

  function onSubmit(selected, selectedStep) {
    const normalizeStep = selectedStep-1;
    console.log("selected: ", selected)
    console.log("allSelected ", allSelected)
    const newSelected = [...allSelected, {
      src: selected.src,
      selectedStep: normalizeStep,
      fullSrc: images[normalizeStep].ref
    }]
    setAllSelected(newSelected)
    console.log("selected: ", newSelected)
    nextBatch(newSelected)
  }

  function onFail() {
    nextBatch()
  }
  
  if(!images?.length) {
    return <div>Empty directory please add photos!</div>
  }
  if(isFinished) {
    return <ShowResult results={allSelected}/> 
  }

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {step > 0 ? 
            <ImageGrid currentStepper={step} onFail={onFail} onSubmit={onSubmit} photos={images[step-1].data}/>
          : <Button onClick={() => setStep(1)}>
            Start
        </Button>}
      </div>
    </>
  )
}

export default App
