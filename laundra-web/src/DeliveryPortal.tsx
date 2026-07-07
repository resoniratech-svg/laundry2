import React, { useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';
import type { User, Order } from './DatabaseContext';

export const DeliveryPortal: React.FC = () => {
  const { db, saveDB } = useDatabase();

  // Authentication & Session States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp-verify' | 'forgot-pass' | 'reset-pass'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration Form
  const [regCompanyId, setRegCompanyId] = useState(db.companies[0]?.id || '');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regVehicleType, setRegVehicleType] = useState('Bike');
  const [regVehicleNumber, setRegVehicleNumber] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRC, setRegRC] = useState('');
  const [regInsuranceNumber, setRegInsuranceNumber] = useState('');
  const [regEmergencyContact, setRegEmergencyContact] = useState('');
  const [regProfilePhoto, setRegProfilePhoto] = useState('');
  const [regLicenseFile, setRegLicenseFile] = useState('');
  const [regInsuranceFile, setRegInsuranceFile] = useState('');

  // OTP Verification Form
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [tempRegDetails, setTempRegDetails] = useState<any>(null);

  // Active Tab for Web Dashboard
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'earnings' | 'attendance' | 'profile' | 'support'>('dashboard');

  // Tasks Sub-tab
  const [tasksSubTab, setTasksSubTab] = useState<'pickups' | 'deliveries'>('pickups');

  // Attendance states
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState<{ time: string; type: 'Clock In' | 'Clock Out'; gps: string }[]>([]);

  // Leaves state
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // OTP Verification Modal inside Deliveries list
  const [verifyingDeliveryOrder, setVerifyingDeliveryOrder] = useState<Order | null>(null);
  const [enteredDeliveryOtp, setEnteredDeliveryOtp] = useState('');

  // Pickup completion details modal
  const [pickupDetailsOrder, setPickupDetailsOrder] = useState<Order | null>(null);
  const [pickupWeightItems, setPickupWeightItems] = useState('1 Bag (Wash & Fold)');
  const [pickupNotes, setPickupNotes] = useState('');

  // Emergency contact states
  const [emergencyContact, setEmergencyContact] = useState('+974 5555 0122');
  const [emergencyName, setEmergencyName] = useState('Jane Doe (Spouse)');

  // Profile fields editing
  const [profAddress, setProfAddress] = useState('456 Delivery Lane, Doha');
  const [sidebarImgError, setSidebarImgError] = useState(false);
  const [profileImgError, setProfileImgError] = useState(false);

  // Support ticket state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [supportTickets, setSupportTickets] = useState<{ id: string; subject: string; message: string; date: string; status: string }[]>([]);

  // Automatically load active session if cached
  useEffect(() => {
    const cachedRole = localStorage.getItem('ll_activerole');
    const cachedBoy = localStorage.getItem('ll_active_delivery_boy');
    if (cachedRole === 'Delivery Boy' && cachedBoy) {
      const found = db.users.find(u => u.name === cachedBoy && u.role === 'delivery');
      if (found) {
        setCurrentUser(found);
      } else {
        // Mock session user if database doesn't have it
        setCurrentUser({
          id: 'u-2',
          name: cachedBoy,
          role: 'delivery',
          email: 'johndoe@laundra.com',
          status: 'Active'
        });
      }
    }
  }, [db.users]);

  // Log Audit Action Helper
  const logAudit = (message: string) => {
    const timestamp = new Date().toLocaleString();
    const newLog = `[${timestamp}] ${message}`;
    console.log(newLog);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = db.users.find(u => u.email.trim().toLowerCase() === loginEmail.trim().toLowerCase() && u.role === 'delivery');
    
    if (!found) {
      alert('Invalid credentials or user not registered as Delivery Staff.');
      return;
    }

    if (found.status === 'Pending') {
      alert('Account Pending: Your application is pending review and approval by the Company Admin. You will be able to log in once approved.');
      return;
    }

    if (found.password !== loginPassword) {
      alert('Invalid email or password.');
      return;
    }

    setCurrentUser(found);
    saveDB({ activeRole: 'Delivery Boy', currentDeliveryBoy: found.name });
    localStorage.setItem('ll_activerole', 'Delivery Boy');
    localStorage.setItem('ll_active_delivery_boy', found.name);
    localStorage.setItem('ll_active_workspace', 'delivery');
    logAudit(`Delivery Agent ${found.name} logged in.`);
  };

  // Handle Registration Submit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.users.find(u => u.email.trim().toLowerCase() === regEmail.trim().toLowerCase())) {
      alert('A user with this email address already exists.');
      return;
    }

    setTempRegDetails({
      name: regName,
      email: regEmail.trim().toLowerCase(),
      phone: regPhone,
      password: regPassword,
      vehicleType: regVehicleType,
      vehicleNumber: regVehicleNumber,
      licenseNumber: regLicense,
      address: regAddress,
      vehicleRc: regRC,
      insuranceNumber: regInsuranceNumber,
      emergencyContact: regEmergencyContact,
      profilePhoto: regProfilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      licenseFile: regLicenseFile || 'https://example.com/license.pdf',
      insuranceFile: regInsuranceFile || 'https://example.com/insurance.pdf',
      companyId: regCompanyId
    });

    logAudit(`Delivery Staff registration submitted (pending OTP verification): ${regName} (${regEmail})`);
    alert('Activation OTP "909090" has been sent to your email address. Please verify it next.');
    setAuthMode('otp-verify');
    setOtpEmail(regEmail);
  };

  // Handle OTP activation validation
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '909090') {
      alert('Invalid OTP code. Please enter 909090.');
      return;
    }

    if (!tempRegDetails) {
      alert('Registration details expired. Please register again.');
      setAuthMode('register');
      return;
    }

    const newAgent: User = {
      id: 'u-' + Date.now(),
      name: tempRegDetails.name,
      role: 'delivery',
      email: tempRegDetails.email,
      password: tempRegDetails.password,
      phone: tempRegDetails.phone,
      status: 'Pending', // Pending approval by Company Admin
      createdAt: new Date().toISOString(),
      vehicleType: tempRegDetails.vehicleType,
      vehicleNumber: tempRegDetails.vehicleNumber,
      licenseNumber: tempRegDetails.licenseNumber,
      address: tempRegDetails.address,
      vehicleRc: tempRegDetails.vehicleRc,
      insuranceNumber: tempRegDetails.insuranceNumber,
      emergencyContact: tempRegDetails.emergencyContact,
      profilePhoto: tempRegDetails.profilePhoto,
      licenseFile: tempRegDetails.licenseFile,
      insuranceFile: tempRegDetails.insuranceFile
    };

    saveDB({
      users: [...db.users, newAgent]
    });

    logAudit(`Delivery Staff applicant ${tempRegDetails.name} verified email OTP. Account created with status 'Pending'.`);
    alert('Email verified successfully! Your application is registered and now pending review/approval by the Company Admin.');
    setTempRegDetails(null);
    setAuthMode('login');
    setLoginEmail(otpEmail);
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = db.users.find(u => u.email.trim().toLowerCase() === forgotEmail.trim().toLowerCase() && u.role === 'delivery');
    if (!found) {
      alert('No registered Delivery Agent found with this email address.');
      return;
    }
    logAudit(`Forgot password requested for ${forgotEmail}. Platform generated reset code.`);
    alert('Forgot Password Code Sent: Centralized notification service has generated a password reset code: "909090".');
    setAuthMode('reset-pass');
  };

  // Handle Reset Password Submit
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode !== '909090') {
      alert('Invalid verification reset code.');
      return;
    }
    const found = db.users.find(u => u.email.trim().toLowerCase() === forgotEmail.trim().toLowerCase() && u.role === 'delivery');
    if (!found) return;

    const updatedUsers = db.users.map(u => u.id === found.id ? { ...u, password: resetNewPassword } : u);
    saveDB({ users: updatedUsers });

    logAudit(`Password reset completed successfully for Delivery Agent: ${found.name}`);
    alert('Password updated successfully! Please log in with your new password.');
    setAuthMode('login');
    setLoginEmail(forgotEmail);
  };

  // Clock In / Clock Out Attendance handler
  const handleClockInOut = () => {
    const timestamp = new Date().toLocaleTimeString();
    const newType = isClockedIn ? 'Clock Out' : 'Clock In';
    const gpsLocation = 'Malibu HQ Branch (' + (25.28 + Math.random()*0.01).toFixed(4) + '° N, ' + (51.52 + Math.random()*0.01).toFixed(4) + '° E)';
    
    setIsClockedIn(!isClockedIn);
    setAttendanceLogs(prev => [{ time: timestamp, type: newType, gps: gpsLocation }, ...prev]);
    logAudit(`Attendance recorded: ${newType} at ${gpsLocation}`);
    alert(`${newType} recorded successfully at: ${gpsLocation}`);
  };

  // Submit Leave Request
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) {
      alert('Please fill out all leave fields.');
      return;
    }
    const newLeave: import('./DatabaseContext').LeaveRequest = {
      id: 'lr-' + Date.now(),
      deliveryBoyName: db.currentDeliveryBoy || 'Unknown',
      deliveryBoyEmail: db.users.find(u => u.name === db.currentDeliveryBoy)?.email || '',
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      reason: leaveReason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    saveDB({ leaveRequests: [...db.leaveRequests, newLeave] });
    logAudit(`Delivery Staff submitted leave application starting ${leaveStartDate}`);
    alert('Leave request submitted to Company Admin.');
    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ll_activerole');
    localStorage.removeItem('ll_active_delivery_boy');
    logAudit('Delivery staff logged out.');
  };

  // Handle Pickup Task Status Update
  const updatePickupStatus = (order: Order, nextStatus: Order['status'], deliveryStatusText: string) => {
    const updatedOrders = db.orders.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          status: nextStatus,
          deliveryStatus: deliveryStatusText
        };
      }
      return o;
    });

    const newNotification = {
      id: Date.now(),
      text: `🚚 Delivery update: Order #${order.id} status updated to: ${nextStatus} (${deliveryStatusText})`,
      time: 'Just now',
      unread: true
    };

    saveDB({
      orders: updatedOrders,
      notifications: [newNotification, ...db.notifications]
    });

    logAudit(`Updated Pickup status of order #${order.id} to: ${nextStatus} (${deliveryStatusText})`);
  };

  // Complete Pickup with weight/notes
  const submitPickupCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDetailsOrder) return;

    const nextStatus = 'Received' as const;
    const deliveryStatusText = 'In Processing';

    const updatedOrders = db.orders.map(o => {
      if (o.id === pickupDetailsOrder.id) {
        return {
          ...o,
          status: nextStatus,
          deliveryStatus: deliveryStatusText,
          weightItems: pickupWeightItems
        };
      }
      return o;
    });

    const newNotification = {
      id: Date.now(),
      text: `🚚 Delivery update: Order #${pickupDetailsOrder.id} status updated to: ${nextStatus} (${deliveryStatusText})`,
      time: 'Just now',
      unread: true
    };

    saveDB({
      orders: updatedOrders,
      notifications: [newNotification, ...db.notifications]
    });

    logAudit(`Updated Pickup status of order #${pickupDetailsOrder.id} to: ${nextStatus} (${deliveryStatusText})`);

    setPickupDetailsOrder(null);
    setPickupNotes('');
    alert('Pickup details saved. Order status updated to "Received".');
  };

  // Complete Delivery with OTP verification
  const submitDeliveryVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingDeliveryOrder) return;

    if (enteredDeliveryOtp !== verifyingDeliveryOrder.deliveryOtp) {
      alert('Incorrect OTP. Please ask the customer to check their secure QR Portal.');
      return;
    }

    const updatedOrders = db.orders.map(o => {
      if (o.id === verifyingDeliveryOrder.id) {
        return {
          ...o,
          status: 'Delivered' as const,
          deliveryStatus: 'Delivered',
          paymentStatus: 'Paid'
        };
      }
      return o;
    });

    const newNotification = {
      id: Date.now(),
      text: `✅ Order #${verifyingDeliveryOrder.id} has been verified with OTP and marked DELIVERED!`,
      time: 'Just now',
      unread: true
    };

    saveDB({
      orders: updatedOrders,
      notifications: [newNotification, ...db.notifications]
    });

    logAudit(`Delivery successfully completed for order #${verifyingDeliveryOrder.id} using OTP.`);
    alert('OTP Verified! Delivery Completed successfully.');
    setVerifyingDeliveryOrder(null);
    setEnteredDeliveryOtp('');
  };

  // Support ticket creation
  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMsg) {
      alert('Please fill out all support ticket fields.');
      return;
    }
    const newTicket = {
      id: 'TKT-' + Math.floor(1000 + Math.random()*9000),
      subject: supportSubject,
      message: supportMsg,
      date: new Date().toLocaleDateString(),
      status: 'Open'
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    alert(`Support ticket ${newTicket.id} raised successfully.`);
    setSupportSubject('');
    setSupportMsg('');
  };

  const assignedOrders = db.orders.filter(o => o.courier && currentUser && o.courier.trim().toLowerCase() === currentUser.name.trim().toLowerCase());

  const pendingPickupsCount = assignedOrders.filter(o => ['Pending Pickup', 'Courier on the way', 'Reached Customer', 'Pickup Assigned'].includes(o.deliveryStatus) || (o.status as string) === 'Pickup Assigned').length;
  const pendingDeliveriesCount = assignedOrders.filter(o => ['ready', 'out for delivery'].includes(o.status.toLowerCase())).length;
  const totalPendingTasksCount = pendingPickupsCount + pendingDeliveriesCount;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: '"Outfit", sans-serif' }}>
      
      {/* Top Navbar */}
      <header style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}>
            <span style={{ fontSize: '1.4rem' }}>🚚</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.75px', color: '#ffffff', textTransform: 'uppercase' }}>
              {db.companies.find(c => c.id === db.activeCompanyId)?.name || 'Laundra'} Go
            </h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>Web-Based Delivery Operations Portal</p>
          </div>
        </div>
        
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)' }}>
              {currentUser.profilePhoto && !sidebarImgError ? (
                <img 
                  src={currentUser.profilePhoto} 
                  alt="profile" 
                  onError={() => setSidebarImgError(true)} 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
                </div>
              )}
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f1f5f9', textTransform: 'capitalize' }}>{currentUser.name}</span>
            </div>
            <button onClick={handleLogout} style={{ border: '1px solid #f43f5e', background: 'transparent', color: '#f43f5e', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🚪</span> Sign Out
            </button>
          </div>
        )}
      </header>

      {!currentUser ? (
        // Non-authenticated card template
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f1f5f9' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '36px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            
            {authMode === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: '900', color: '#1e3a8a', textAlign: 'center' }}>Delivery Agent Sign In</h2>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Select Company Partner</label>
                  <select value={regCompanyId} onChange={e => setRegCompanyId(e.target.value)} style={{ width: '100%', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}>
                    {db.companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Email Address</label>
                  <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="e.g. driver@laundra.com" style={{ width: '100%', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '0.9rem' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Password</label>
                  <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '0.9rem' }} />
                </div>

                <button type="submit" style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', marginTop: '6px' }}>Sign In to Workspace</button>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <a onClick={() => setAuthMode('register')} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}>Apply for Job Position</a>
                    <a onClick={() => setAuthMode('forgot-pass')} style={{ color: '#ef4444', cursor: 'pointer', fontWeight: '700' }}>Forgot Password?</a>
                  </div>
                  <div>
                    <a onClick={() => setAuthMode('otp-verify')} style={{ color: '#7c3aed', cursor: 'pointer', fontWeight: '700', display: 'block', textAlign: 'center' }}>Verify Account OTP</a>
                  </div>
                </div>
              </form>
            )}

            {authMode === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '520px', margin: '0 auto', background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: '900', color: '#1e3a8a', textAlign: 'center' }}>Job Application Form</h2>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Company Code</label>
                  <select value={regCompanyId} onChange={e => setRegCompanyId(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #cbd5e1', borderRadius: '8px' }}>
                    {db.companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Full Name</label>
                    <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} placeholder="Alex APK Driver" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Email Address</label>
                    <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="charantechfive@gmail.com" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Phone</label>
                    <input type="tel" required value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+1234567890" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Password</label>
                    <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Vehicle Type</label>
                    <select value={regVehicleType} onChange={e => setRegVehicleType(e.target.value)} style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px' }}>
                      <option value="Bike">Bike</option>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Vehicle Number</label>
                    <input type="text" required value={regVehicleNumber} onChange={e => setRegVehicleNumber(e.target.value)} placeholder="KA-05-CD-9999" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>License Number</label>
                    <input type="text" required value={regLicense} onChange={e => setRegLicense(e.target.value)} placeholder="DL-12345" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Vehicle RC</label>
                    <input type="text" required value={regRC} onChange={e => setRegRC(e.target.value)} placeholder="RC-12345" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Insurance Number</label>
                    <input type="text" required value={regInsuranceNumber} onChange={e => setRegInsuranceNumber(e.target.value)} placeholder="INS-12345" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Emergency Contact</label>
                    <input type="tel" required value={regEmergencyContact} onChange={e => setRegEmergencyContact(e.target.value)} placeholder="+1987654321" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Address</label>
                  <input type="text" required value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="789 APK Street, Bangalore" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', marginBottom: '4px' }}>Profile Photo URL</label>
                    <input type="text" value={regProfilePhoto} onChange={e => setRegProfilePhoto(e.target.value)} placeholder="https://example.com/alex.jpg" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '0.75rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', marginBottom: '4px' }}>License File URL</label>
                    <input type="text" value={regLicenseFile} onChange={e => setRegLicenseFile(e.target.value)} placeholder="https://example.com/license.pdf" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '0.75rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', marginBottom: '4px' }}>Insurance File URL</label>
                    <input type="text" value={regInsuranceFile} onChange={e => setRegInsuranceFile(e.target.value)} placeholder="https://example.com/insurance.pdf" style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '0.75rem' }} />
                  </div>
                </div>

                <button type="submit" style={{ padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }}>Submit Application</button>
                <button type="button" onClick={() => setAuthMode('login')} style={{ padding: '10px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel & Back</button>
              </form>
            )}

            {authMode === 'otp-verify' && (
              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: '900', color: '#1e3a8a', textAlign: 'center' }}>Account Verification</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', margin: 0 }}>Input your account activation OTP code sent through Super Admin's Central Notification Service after approval.</p>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Registered Email</label>
                  <input type="email" required value={otpEmail} onChange={e => setOtpEmail(e.target.value)} style={{ width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Email Activation OTP Code</label>
                  <input type="text" required value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="e.g. 806080" style={{ width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Set Password</label>
                  <input type="password" required value={otpNewPassword} onChange={e => setOtpNewPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" style={{ padding: '12px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Verify & Activate Account</button>
                <button type="button" onClick={() => setAuthMode('login')} style={{ padding: '10px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Back to Sign In</button>
              </form>
            )}

            {authMode === 'forgot-pass' && (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: '900', color: '#1e3a8a', textAlign: 'center' }}>Forgot Password</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', margin: 0 }}>Enter your registered email address to receive a verification code.</p>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Registered Email</label>
                  <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="e.g. driver@laundra.com" style={{ width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Request Reset Code</button>
                <button type="button" onClick={() => setAuthMode('login')} style={{ padding: '10px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Back to Sign In</button>
              </form>
            )}

            {authMode === 'reset-pass' && (
              <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: '900', color: '#1e3a8a', textAlign: 'center' }}>Reset Password</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', margin: 0 }}>Input the verification code and set your new password.</p>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Verification Reset Code</label>
                  <input type="text" required value={resetCode} onChange={e => setResetCode(e.target.value)} placeholder="e.g. 909090" style={{ width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>New Password</label>
                  <input type="password" required value={resetNewPassword} onChange={e => setResetNewPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" style={{ padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Reset Password</button>
                <button type="button" onClick={() => setAuthMode('login')} style={{ padding: '10px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              </form>
            )}

          </div>
        </div>
      ) : (
        
        // Authenticated Dashboard Layout
        <div style={{ flex: 1, display: 'flex', background: '#f1f5f9' }}>
          
          {/* Left Sidebar Navigation Panel */}
          <aside style={{ width: '260px', background: '#0f172a', color: '#94a3b8', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b' }}>
            <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentUser.profilePhoto && !sidebarImgError ? (
                <img 
                  src={currentUser.profilePhoto} 
                  alt="profile" 
                  onError={() => setSidebarImgError(true)} 
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
                </div>
              )}
              <div>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>{currentUser.name}</div>
                <span style={{ fontSize: '0.72rem', background: '#16a34a', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold' }}>Active Duty</span>
              </div>
            </div>

            <nav style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              {[
                { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
                { id: 'tasks', label: '📋 Assigned Tasks', icon: '📋' },
                { id: 'earnings', label: '💵 My Earnings', icon: '💵' },
                { id: 'attendance', label: '📅 Duty & Leaves', icon: '📅' },
                { id: 'profile', label: '👤 Profile & Verification', icon: '👤' },
                { id: 'support', label: '🎫 Helpdesk Support', icon: '🎫' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === tab.id ? '#2563eb' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#94a3b8',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {tab.label}
                  </span>
                  {tab.id === 'tasks' && totalPendingTasksCount > 0 && (
                    <span style={{
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.68rem',
                      fontWeight: '800'
                    }}>
                      {totalPendingTasksCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            
            <div style={{ padding: '16px', borderTop: '1px solid #1e293b', fontSize: '0.72rem', textAlign: 'center' }}>
              Logged in to {db.companies.find(c => c.id === db.activeCompanyId)?.name || 'HQ'}
            </div>
          </aside>

          {/* Right Main Content Pane */}
          <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
            
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Header widget */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Welcome back, {currentUser.name}!</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Here is your delivery operations summary for today.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>GPS Status</div>
                      <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>📡 Connected (Active)</div>
                    </div>
                    <button onClick={handleClockInOut} style={{ padding: '10px 20px', background: isClockedIn ? '#ef4444' : '#16a34a', color: 'white', border: 'none', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                      {isClockedIn ? 'Clock Out (End Duty)' : 'Clock In (Start Duty)'}
                    </button>
                  </div>
                </div>

                {/* Metrics Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>🧺</span>
                      <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>Pickups</span>
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0f172a', margin: '14px 0 4px 0' }}>
                      {pendingPickupsCount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pending Pickups Assigned</div>
                  </div>

                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>🚚</span>
                      <span style={{ background: '#f5f3ff', color: '#5b21b6', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>Deliveries</span>
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0f172a', margin: '14px 0 4px 0' }}>
                      {pendingDeliveriesCount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pending Drops Assigned</div>
                  </div>

                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>✅</span>
                      <span style={{ background: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>Drops</span>
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#16a34a', margin: '14px 0 4px 0' }}>
                      {assignedOrders.filter(o => o.status === 'Delivered').length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Successful drops completed</div>
                  </div>

                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>💵</span>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>Earnings</span>
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#16a34a', margin: '14px 0 4px 0' }}>
                      QR {(assignedOrders.filter(o => o.status === 'Delivered').length * 15).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Today's flat-rate earnings</div>
                  </div>
                </div>

                {/* Notifications & Announcements Panel Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Notifications Feed */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>🔔 Live Notifications Feed</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                      {db.notifications.map(n => (
                        <div key={n.id} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{n.text}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Announcements Feed */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>📢 Active Company Announcements</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                      {db.announcements.filter(a => a.targetAudience === 'All' || a.targetAudience === 'Delivery Staff').length === 0 ? (
                        <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No active announcements for staff.</div>
                      ) : (
                        db.announcements.filter(a => a.targetAudience === 'All' || a.targetAudience === 'Delivery Staff').map(a => (
                          <div key={a.id} style={{ background: '#faf5ff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd6fe', fontSize: '0.82rem' }}>
                            <strong style={{ color: '#5b21b6' }}>{a.title}</strong>
                            <p style={{ margin: '4px 0 0 0', color: '#475569' }}>{a.content}</p>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{a.date} | by {a.author}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: TASKS */}
            {activeTab === 'tasks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Assigned Delivery Tasks</h2>
                  
                  {/* Task type selectors */}
                  <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
                    <button onClick={() => setTasksSubTab('pickups')} style={{ padding: '8px 20px', border: 'none', borderRadius: '6px', background: tasksSubTab === 'pickups' ? 'white' : 'transparent', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🧺 Pickups
                      {pendingPickupsCount > 0 && (
                        <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: '800' }}>
                          {pendingPickupsCount}
                        </span>
                      )}
                    </button>
                    <button onClick={() => setTasksSubTab('deliveries')} style={{ padding: '8px 20px', border: 'none', borderRadius: '6px', background: tasksSubTab === 'deliveries' ? 'white' : 'transparent', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🚚 Deliveries
                      {pendingDeliveriesCount > 0 && (
                        <span style={{ background: '#7c3aed', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: '800' }}>
                          {pendingDeliveriesCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {tasksSubTab === 'pickups' ? (
                    assignedOrders.filter(o => ['Pending Pickup', 'Courier on the way', 'Reached Customer', 'Pickup Assigned'].includes(o.deliveryStatus) || (o.status as string) === 'Pickup Assigned').length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '60px 0' }}>No pending pickup assignments.</div>
                    ) : (
                      assignedOrders.filter(o => ['Pending Pickup', 'Courier on the way', 'Reached Customer', 'Pickup Assigned'].includes(o.deliveryStatus) || (o.status as string) === 'Pickup Assigned').map(o => (
                        <div key={o.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <strong style={{ color: '#1e3a8a', fontSize: '1rem' }}>Order #{o.id}</strong>
                              <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>{o.deliveryStatus || o.status}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                              <div>👤 <strong>Client Name:</strong> {o.customerName}</div>
                              <div>📞 <strong>Client Phone:</strong> {o.phone || 'N/A'}</div>
                              <div>📍 <strong>Address:</strong> {o.address || 'Pickup at Branch'}</div>
                              <div>🧺 <strong>Services:</strong> {o.services?.map(s => `${s.name} x${s.qty}`).join(', ') || o.weightItems || 'Standard Laundry Load'}</div>
                              <div>📅 <strong>Pickup Time:</strong> {o.date} (10:00 AM - 1:00 PM)</div>
                              <div>📝 <strong>Instructions:</strong> Handle with care, separate whites.</div>
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                              <button onClick={() => window.open(`tel:${o.phone || '555-0199'}`)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>📞 Contact Client</button>
                              <button onClick={() => alert(`Launching navigation to: ${o.address}`)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>🗺️ Navigate</button>
                            </div>
                            
                            {(o.deliveryStatus === 'Pending Pickup' || (o.status as string) === 'Pickup Assigned') && (
                              <button onClick={() => updatePickupStatus(o, 'Accepted', 'Courier on the way')} style={{ width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>🚀 Mark On the Way</button>
                            )}
                            {o.deliveryStatus === 'Courier on the way' && (
                              <button onClick={() => updatePickupStatus(o, 'Accepted', 'Reached Customer')} style={{ width: '100%', padding: '10px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>📍 Mark Reached Location</button>
                            )}
                            {o.deliveryStatus === 'Reached Customer' && (
                              <button onClick={() => setPickupDetailsOrder(o)} style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>🧺 Complete Pickup Details</button>
                            )}
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    assignedOrders.filter(o => ['ready', 'out for delivery'].includes(o.status.toLowerCase())).length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '60px 0' }}>No pending delivery assignments.</div>
                    ) : (
                      assignedOrders.filter(o => ['ready', 'out for delivery'].includes(o.status.toLowerCase())).map(o => (
                        <div key={o.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <strong style={{ color: '#1e3a8a', fontSize: '1rem' }}>Order #{o.id}</strong>
                              <span style={{ fontSize: '0.75rem', background: '#faf5ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>{o.status}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                              <div>👤 <strong>Client Name:</strong> {o.customerName}</div>
                              <div>📞 <strong>Client Phone:</strong> {o.phone || 'N/A'}</div>
                              <div>📍 <strong>Address:</strong> {o.address || 'Delivery Address'}</div>
                              <div>🧺 <strong>Services:</strong> {o.services?.map(s => `${s.name} x${s.qty}`).join(', ') || o.weightItems || 'Standard Laundry Load'}</div>
                              <div>📅 <strong>Delivery Time:</strong> {o.date} (3:00 PM - 6:00 PM)</div>
                              <div>💳 <strong>Method:</strong> {o.paymentMethod} ({o.paymentStatus || 'Unpaid'})</div>
                              <div>📝 <strong>Instructions:</strong> Verify OTP code upon arrival.</div>
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                              <button onClick={() => window.open(`tel:${o.phone || '555-0199'}`)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>📞 Contact Client</button>
                              <button onClick={() => alert(`Launching navigation to: ${o.address}`)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>🗺️ Navigate</button>
                            </div>
                            {o.status === 'Ready' && (
                              <button onClick={() => updatePickupStatus(o, 'Out for Delivery', 'Out for Delivery')} style={{ width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>🚚 Mark Out For Delivery</button>
                            )}
                            {o.status === 'Out for Delivery' && (
                              <button onClick={() => setVerifyingDeliveryOrder(o)} style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>🔑 Verify OTP & Complete</button>
                            )}
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: EARNINGS */}
            {activeTab === 'earnings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>My Earnings Ledger</h2>
                
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', maxWidth: '400px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold' }}>Total Earnings (Today)</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#16a34a', margin: '10px 0' }}>
                    QR {(assignedOrders.filter(o => o.status === 'Delivered').length * 15).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Flat drop payout rates: <strong>QR 15.00</strong> per completed drop</div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#1e293b' }}>Earnings projections log</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span>Completed Deliveries:</span>
                      <strong>{assignedOrders.filter(o => o.status === 'Delivered').length} orders</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span>Weekly Estimate (Avg 6 days):</span>
                      <strong>QR {(assignedOrders.filter(o => o.status === 'Delivered').length * 15 * 6).toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Monthly Estimate (Avg 26 days):</span>
                      <strong>QR {(assignedOrders.filter(o => o.status === 'Delivered').length * 15 * 26).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DUTY & LEAVES */}
            {activeTab === 'attendance' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Duty & Attendance log</h2>
                  
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>Clock Logs History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {attendanceLogs.length === 0 ? (
                        <div style={{ color: '#64748b', padding: '10px 0' }}>No attendance registered today.</div>
                      ) : (
                        attendanceLogs.map((log, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: log.type === 'Clock In' ? '#16a34a' : '#ef4444' }}>{log.type}</span>
                            <span style={{ color: '#64748b' }}>{log.time}</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{log.gps.slice(0, 15)}...</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Apply for Leave</h2>
                  
                  <form onSubmit={handleApplyLeave} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>Start Date</label>
                        <input type="date" required value={leaveStartDate} onChange={e => setLeaveStartDate(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>End Date</label>
                        <input type="date" required value={leaveEndDate} onChange={e => setLeaveEndDate(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>Reason</label>
                      <input type="text" required value={leaveReason} onChange={e => setLeaveReason(e.target.value)} placeholder="Reason for leave" style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>

                    <button type="submit" style={{ padding: '10px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>Submit Request</button>
                  </form>

                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>Leave History Status</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                      {db.leaveRequests.filter(lr => lr.deliveryBoyName === db.currentDeliveryBoy).length === 0 ? (
                        <div style={{ color: '#64748b' }}>No requests submitted.</div>
                      ) : (
                        db.leaveRequests.filter(lr => lr.deliveryBoyName === db.currentDeliveryBoy).map((lh, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            <span>{lh.startDate} to {lh.endDate} ({lh.reason})</span>
                            <span style={{ fontWeight: 'bold', color: lh.status === 'Approved' ? '#16a34a' : lh.status === 'Rejected' ? '#ef4444' : '#d97706' }}>{lh.status}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: PROFILE */}
            {activeTab === 'profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>My Profile Details</h2>
                  
                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {currentUser.profilePhoto && !profileImgError ? (
                      <img 
                        src={currentUser.profilePhoto} 
                        alt="profile" 
                        onError={() => setProfileImgError(true)} 
                        style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }} 
                      />
                    ) : (
                      <div style={{ 
                        width: '70px', 
                        height: '70px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold',
                        fontSize: '1.8rem',
                        border: '2px solid #2563eb'
                      }}>
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{currentUser.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        <div>🚚 Vehicle: {currentUser.vehicleType || 'Bike'}</div>
                        <div>Plate Number: {currentUser.vehicleNumber || 'QA-8829'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>🗂️ Verification Credentials</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Aadhaar ID Status:</span>
                        <strong style={{ color: '#16a34a' }}>✓ VERIFIED</strong>
                      </div>
                      <input type="file" onChange={() => alert('Aadhaar Document uploaded successfully. Under review.')} style={{ fontSize: '0.75rem' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Driving License Status:</span>
                        <strong style={{ color: '#16a34a' }}>✓ VERIFIED</strong>
                      </div>
                      <input type="file" onChange={() => alert('Driving License Document uploaded successfully. Under review.')} style={{ fontSize: '0.75rem' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Vehicle RC Status:</span>
                        <strong style={{ color: '#16a34a' }}>✓ VERIFIED</strong>
                      </div>
                      <input type="file" onChange={() => alert('Vehicle RC Document uploaded successfully. Under review.')} style={{ fontSize: '0.75rem' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Insurance Policy Status:</span>
                        <strong style={{ color: '#16a34a' }}>✓ VERIFIED</strong>
                      </div>
                      <input type="file" onChange={() => alert('Vehicle Insurance Document uploaded successfully. Under review.')} style={{ fontSize: '0.75rem' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Edit Contact Information</h2>
                  
                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>Home Address</label>
                      <input type="text" value={profAddress} onChange={e => setProfAddress(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>Emergency Contact Name</label>
                      <input type="text" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>Emergency Contact Phone</label>
                      <input type="text" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>

                    <button onClick={() => alert('Personal settings update completed.')} style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', marginTop: '6px' }}>Save Profiles Changes</button>
                  </div>

                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Change Password</h2>
                  <form onSubmit={(e) => { e.preventDefault(); alert('Password successfully changed!'); }} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>Old Password</label>
                      <input type="password" required style={{ width: '100%', padding: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>New Password</label>
                      <input type="password" required style={{ width: '100%', padding: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ padding: '10px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>Update Password</button>
                  </form>
                </div>

              </div>
            )}

            {/* TAB 6: SUPPORT */}
            {activeTab === 'support' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Helpdesk Support</h2>
                  
                  <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '0.85rem' }}>
                    <strong>🏢 Company Admin Desk Contacts</strong>
                    <div style={{ marginTop: '6px' }}>📞 Phone Line: +974 5555 0100</div>
                    <div>✉️ Email Support: admin@laundrahq.com</div>
                  </div>

                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>Support Ticket History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                      {supportTickets.length === 0 ? (
                        <div style={{ color: '#64748b' }}>No active helpdesk tickets.</div>
                      ) : (
                        supportTickets.map((t, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            <span><strong>{t.id}</strong>: {t.subject}</span>
                            <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{t.status}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Raise Support Ticket</h2>
                  
                  <form onSubmit={handleRaiseTicket} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>Subject</label>
                      <input type="text" required value={supportSubject} onChange={e => setSupportSubject(e.target.value)} placeholder="Issue title" style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>Message Description</label>
                      <textarea required value={supportMsg} onChange={e => setSupportMsg(e.target.value)} placeholder="Please detail the issue..." style={{ width: '100%', height: '100px', padding: '10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', resize: 'none' }} />
                    </div>

                    <button type="submit" style={{ padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>Raise Support Ticket</button>
                  </form>
                </div>

              </div>
            )}

          </main>
        </div>
      )}

      {/* --- MODAL: PICKUP COMPLETION DETAILS --- */}
      {pickupDetailsOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '360px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            <h4 style={{ margin: '0 0 14px 0', color: '#1e3a8a' }}>🧺 Pickup Details Confirmation</h4>
            <form onSubmit={submitPickupCompletion} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>Bags / Total Weight (Quantity)</label>
                <input type="text" required value={pickupWeightItems} onChange={e => setPickupWeightItems(e.target.value)} placeholder="e.g. 1 Bag (Wash & Fold)" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>Pickup Inspection Notes (Optional)</label>
                <input type="text" value={pickupNotes} onChange={e => setPickupNotes(e.target.value)} placeholder="Heavy stains on standard shirt" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setPickupDetailsOrder(null)} style={{ padding: '6px 12px', border: '1.5px solid #cbd5e1', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '6px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Pickup</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: DELIVERY OTP VERIFICATION --- */}
      {verifyingDeliveryOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '360px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a' }}>🔑 Verify Delivery OTP</h4>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 14px 0' }}>Ask the customer for the secure OTP shown on their QR Browser Portal to complete delivery.</p>
            
            <form onSubmit={submitDeliveryVerification} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>Enter Customer's OTP Code</label>
                <input type="text" required value={enteredDeliveryOtp} onChange={e => setEnteredDeliveryOtp(e.target.value)} placeholder="6-digit OTP" style={{ width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', textAlign: 'center', fontSize: '1.25rem', letterSpacing: '3px', fontWeight: 'bold' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setVerifyingDeliveryOrder(null)} style={{ padding: '6px 12px', border: '1.5px solid #cbd5e1', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '6px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Verify & Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
