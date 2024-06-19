import Subtitle from "../Typography/Subtitle"

  
  function TitleCard({title, children, topMargin, TopSideButtons}){
      return(
          <div className={"card w-full p-3 md:p-6 bg-base-100 shadow-xl " + (topMargin || "mt-4")}>

            {/* Title for Card */}
              <Subtitle styleClass={TopSideButtons ? "inline-block" : ""}>
                {title}

                {/* Top side button, show only if present */}
                {
                    TopSideButtons && <div className="inline-block float-right">{TopSideButtons}</div>
                }
              </Subtitle>
              
              <div className="divider my-2"></div>
          
              {/** Card Body */}
              <div className='h-full w-full pb-4 bg-base-100'>
                  {children}
              </div>
          </div>
          
      )
  }
  
  
  export default TitleCard