import Search from "../components/search";

export default function Hask() {
  return (
    <div className={"h-full w-full flex justify-center transform duration-[1600ms] rounded-[12px] "}>      
      <div className="h-full w-[100%] flex justify-center relative">
          <Search/>
        </div>
    </div>
  )
}