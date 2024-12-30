/* eslint-disable react/prop-types */

export default function ShowResult({ results }) {
    Object.values(import.meta.glob('@assets/**', { eager: true, as: 'url' }))
    
    const SingleImage = ({src, selectedStep}) => {
        return <div style={{flexDirection:'column', display: 'flex', justifyContent:'center', alignItems:'center'}}>
            <h2>Step: {selectedStep}</h2>
            <img height={400} style={{height: 400, margin: 5}} key={src} src={`/src/${src}`} alt=""/>
        </div>
    }
    return (
        <div style={{flex: 1, width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
            <h2>Finished!</h2>
            <div style={{flex: 1, display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
                {results.map(e => <SingleImage key={e.src} src={e.src} selectedStep={e.selectedStep}/>)}
            </div>
        </div>
    )
}
