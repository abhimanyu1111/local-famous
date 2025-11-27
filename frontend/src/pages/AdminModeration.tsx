
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function AdminModeration() {
  const [vendors, setVendors] = useState([]);
  const [listings, setListings] = useState([]);

  useEffect(()=>{
    api.get('/admin/pending/vendors').then(r=>setVendors(r.data));
    api.get('/admin/pending/listings').then(r=>setListings(r.data));
  },[]);

  const verifyVendor = async (id)=>{ await api.patch(`/vendors/${id}/verify`, {}); setVendors(vendors.filter(v=>v._id!==id)); };
  const publishListing = async (id)=>{ await api.patch(`/listings/${id}/status`, { status: 'published' }); setListings(listings.filter(l=>l._id!==id)); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Moderation</h1>

      <div className="card bg-base-100 shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Pending Vendors</h2>
        <ul className="space-y-2">
          {vendors.map(v=> <li key={v._id} className="flex items-center justify-between"><span>{v._id} · {v.phone}</span><button className="btn btn-sm btn-primary" onClick={()=>verifyVendor(v._id)}>Verify</button></li>)}
        </ul>
      </div>
    </div>
  );
}
