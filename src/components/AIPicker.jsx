import CustomButton from "./CustomButton"



const AIPicker = ({prompt , setPrompt , generatingImg , handleSubmit}) => {
  return (
    <div className="aipicker-container">
      <textarea 
      placeholder="Ask AI to generate an image for you..."
      rows={5}
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      className="aipicker-textarea" />
      <div className="flex flex-wrap gap-3">
      {generatingImg? (
        <CustomButton type="outline" title="Generating..." customStyles="text-xs" />
      ): (
        <>
        <CustomButton type="outline" title="Generate logo" customStyles="text-xs" handleClick={()=>handleSubmit('logo')} />
       
        <CustomButton type="filled" title="Generate full" customStyles="text-xs" handleClick={()=>handleSubmit('logo')} />
        </>
      )}

      </div>
    </div>
  )
}

export default AIPicker