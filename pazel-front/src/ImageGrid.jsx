/* eslint-disable react/prop-types */
import styled from 'styled-components';
import useImage from './useImageHook';
import { useState } from 'react'
import { Button } from 'antd';


const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
//   grid-template-rows: repeat(${({ rows }) => rows}, ${({ cellHeight }) => cellHeight}px);
  gap: 10px;
  max-width: 100%;
  margin: auto;
`;

const COL_LIMIT = 4 ;
const ROW_LIMIT = 2;
const CONTAINER_HEIGHT = 350; // Total height for the grid

const NORMAL_IMAGE = {
    height: CONTAINER_HEIGHT,
    padding: 10,
    borderRadius: 15
}
const SELECTED_IMAGE = {
    ...NORMAL_IMAGE,
    backgroundColor: 'blue'
}
const ImageGrid = ({ photos, onSubmit, onFail, currentStepper }) => {
    const [selected, setSelected] = useState(null)
    const numberOfPhotos = photos.length;
    const rows = Math.min(ROW_LIMIT, Math.ceil(numberOfPhotos / COL_LIMIT));
    const columns = Math.min(
        COL_LIMIT,
        Math.ceil(numberOfPhotos / rows)
    );
    const cellHeight = Math.floor(CONTAINER_HEIGHT / rows);

    function onImageClick(index) {
        setSelected(index)
    }

    function _onSubmit(selected) {
        onSubmit(photos[selected], currentStepper)
    }

    const SingleImage = ({ src, isSelected, onClick, index }) => {
        const { loading, error, image } = useImage(src)

        if (error) return <p>error</p>

        return (
            <>
                {loading ? (
                    <p>loading</p>
                ) : (
                    <img
                        onClick={() => onClick(index)}
                        style={isSelected ? SELECTED_IMAGE : NORMAL_IMAGE}
                        src={image}
                        alt={<div>error</div>}
                    />
                )}
            </>
        )
    }
    return (
        <div style={{display: 'flex', flex: 1,  flexDirection:'column'}}>
            <div style={{display: 'flex', flex: 8, justifyContent: 'center', alignItems: 'center'}}>
                <GridContainer columns={columns} rows={rows} cellHeight={cellHeight}>
                {photos.map((photo, index) => (
                    <SingleImage isSelected={index === selected} onClick={onImageClick} index={index} key={photo.src} src={photo.src}/>
                ))}
                </GridContainer>
            </div>
            <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10,  marginTop: 50}}>
              <Button size='large' danger onClick={onFail}>Cant find</Button>
              <Button size='large' type='primary' onClick={() => _onSubmit(selected)}>Pick</Button>
            </div>
        </div>
    );
};

export default ImageGrid;