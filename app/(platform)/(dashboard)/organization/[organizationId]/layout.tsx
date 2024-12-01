import { OrgControl } from "./_components/org-cotnrol"

const OrganizationIdLayout=({
    children
}:{
    children :React.ReactNode
})=>{
    return (
        <>
        <OrgControl/>
          {children}
        </>
    )
}

export default OrganizationIdLayout