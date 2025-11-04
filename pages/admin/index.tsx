import { AdminLayout, AdminPageWrap } from "@/components/admin/common";

export default function AdminIndex() {
  return (
    <AdminLayout> 
      <AdminPageWrap title="Dashboard" breadcrumbItems={[{label: 'Dashboard', href: '/admin'}]}>
        <div>AdminIndex</div>
      </AdminPageWrap>
    </AdminLayout>
  );
}