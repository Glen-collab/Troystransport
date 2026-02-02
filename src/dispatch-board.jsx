import React, { useState, useEffect } from 'react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialTruckers = [
  { id: generateId(), name: 'John Smith', phone: '555-0101', truck: 'Freightliner #12' },
  { id: generateId(), name: 'Maria Garcia', phone: '555-0102', truck: 'Peterbilt #08' },
  { id: generateId(), name: 'Dave Wilson', phone: '555-0103', truck: 'Kenworth #15' },
];

const initialPayloads = [
  { 
    id: generateId(), 
    description: 'Steel Beams - 20 tons',
    origin: 'Chicago, IL',
    destination: 'Milwaukee, WI',
    pickupDate: '2025-02-03',
    pickupTime: '08:00',
    deliveryDate: '2025-02-03',
    assignedTrucker: null,
    status: 'unassigned'
  },
  { 
    id: generateId(), 
    description: 'Produce - Refrigerated',
    origin: 'Madison, WI',
    destination: 'Minneapolis, MN',
    pickupDate: '2025-02-04',
    pickupTime: '06:00',
    deliveryDate: '2025-02-04',
    assignedTrucker: null,
    status: 'unassigned'
  },
];

export default function TruckingDispatchBoard() {
  const [truckers, setTruckers] = useState([]);
  const [payloads, setPayloads] = useState([]);
  const [draggedTrucker, setDraggedTrucker] = useState(null);
  const [showAddTrucker, setShowAddTrucker] = useState(false);
  const [showAddPayload, setShowAddPayload] = useState(false);
  const [editingTrucker, setEditingTrucker] = useState(null);
  const [editingPayload, setEditingPayload] = useState(null);
  const [filter, setFilter] = useState('active');
  const [newTrucker, setNewTrucker] = useState({ name: '', phone: '', truck: '' });
  const [newPayload, setNewPayload] = useState({
    description: '',
    origin: '',
    destination: '',
    pickupDate: '',
    pickupTime: '',
    deliveryDate: ''
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedTruckers = localStorage.getItem('dispatch_truckers');
    const savedPayloads = localStorage.getItem('dispatch_payloads');
    
    if (savedTruckers) {
      setTruckers(JSON.parse(savedTruckers));
    } else {
      setTruckers(initialTruckers);
    }
    
    if (savedPayloads) {
      setPayloads(JSON.parse(savedPayloads));
    } else {
      setPayloads(initialPayloads);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (truckers.length > 0 || payloads.length > 0) {
      localStorage.setItem('dispatch_truckers', JSON.stringify(truckers));
      localStorage.setItem('dispatch_payloads', JSON.stringify(payloads));
    }
  }, [truckers, payloads]);

  // Check if trucker is assigned to any active payload
  const isTruckerAssigned = (truckerId) => {
    return payloads.some(p => p.assignedTrucker === truckerId && p.status !== 'completed');
  };

  // Get trucker's current assignment
  const getTruckerAssignment = (truckerId) => {
    return payloads.find(p => p.assignedTrucker === truckerId && p.status !== 'completed');
  };

  // Drag handlers
  const handleDragStart = (e, trucker) => {
    if (isTruckerAssigned(trucker.id)) return;
    setDraggedTrucker(trucker);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, payloadId) => {
    e.preventDefault();
    if (!draggedTrucker) return;
    
    setPayloads(prev => prev.map(p => {
      if (p.id === payloadId && !p.assignedTrucker) {
        return { ...p, assignedTrucker: draggedTrucker.id, status: 'assigned' };
      }
      return p;
    }));
    setDraggedTrucker(null);
  };

  // Click to assign (alternative to drag)
  const handleTruckerClick = (trucker) => {
    if (isTruckerAssigned(trucker.id)) return;
    setDraggedTrucker(draggedTrucker?.id === trucker.id ? null : trucker);
  };

  const handlePayloadClick = (payload) => {
    if (draggedTrucker && !payload.assignedTrucker && payload.status !== 'completed') {
      setPayloads(prev => prev.map(p => {
        if (p.id === payload.id) {
          return { ...p, assignedTrucker: draggedTrucker.id, status: 'assigned' };
        }
        return p;
      }));
      setDraggedTrucker(null);
    }
  };

  // Unassign trucker
  const handleUnassign = (payloadId) => {
    setPayloads(prev => prev.map(p => {
      if (p.id === payloadId) {
        return { ...p, assignedTrucker: null, status: 'unassigned' };
      }
      return p;
    }));
  };

  // Mark as complete
  const handleComplete = (payloadId) => {
    setPayloads(prev => prev.map(p => {
      if (p.id === payloadId) {
        return { ...p, status: 'completed' };
      }
      return p;
    }));
  };

  // Mark as in transit
  const handleInTransit = (payloadId) => {
    setPayloads(prev => prev.map(p => {
      if (p.id === payloadId) {
        return { ...p, status: 'in-transit' };
      }
      return p;
    }));
  };

  // Add new trucker
  const handleAddTrucker = () => {
    if (!newTrucker.name.trim()) return;
    setTruckers(prev => [...prev, { ...newTrucker, id: generateId() }]);
    setNewTrucker({ name: '', phone: '', truck: '' });
    setShowAddTrucker(false);
  };

  // Add new payload
  const handleAddPayload = () => {
    if (!newPayload.description.trim()) return;
    setPayloads(prev => [...prev, { 
      ...newPayload, 
      id: generateId(), 
      assignedTrucker: null, 
      status: 'unassigned' 
    }]);
    setNewPayload({
      description: '',
      origin: '',
      destination: '',
      pickupDate: '',
      pickupTime: '',
      deliveryDate: ''
    });
    setShowAddPayload(false);
  };

  // Delete trucker
  const handleDeleteTrucker = (truckerId) => {
    if (isTruckerAssigned(truckerId)) {
      alert('Cannot delete trucker with active assignment. Unassign first.');
      return;
    }
    setTruckers(prev => prev.filter(t => t.id !== truckerId));
  };

  // Delete payload
  const handleDeletePayload = (payloadId) => {
    setPayloads(prev => prev.filter(p => p.id !== payloadId));
  };

  // Update trucker
  const handleUpdateTrucker = () => {
    setTruckers(prev => prev.map(t => 
      t.id === editingTrucker.id ? editingTrucker : t
    ));
    setEditingTrucker(null);
  };

  // Update payload
  const handleUpdatePayload = () => {
    setPayloads(prev => prev.map(p => 
      p.id === editingPayload.id ? editingPayload : p
    ));
    setEditingPayload(null);
  };

  // Get trucker by ID
  const getTruckerById = (id) => truckers.find(t => t.id === id);

  // Filter payloads
  const filteredPayloads = payloads.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'active') return p.status !== 'completed';
    if (filter === 'unassigned') return p.status === 'unassigned';
    if (filter === 'assigned') return p.status === 'assigned' || p.status === 'in-transit';
    if (filter === 'completed') return p.status === 'completed';
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a2e', 
      color: '#eee',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#16213e', 
        padding: '16px 24px',
        borderBottom: '2px solid #0f3460',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#e94560' }}>
          🚛 Dispatch Board
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {draggedTrucker && (
            <div style={{
              backgroundColor: '#e94560',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              Click a payload to assign: <strong>{draggedTrucker.name}</strong>
              <button 
                onClick={() => setDraggedTrucker(null)}
                style={{
                  marginLeft: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >×</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        height: 'calc(100vh - 70px)',
        overflow: 'hidden'
      }}>
        {/* Left Side - Payloads */}
        <div style={{ 
          flex: '1 1 65%', 
          padding: '20px',
          overflowY: 'auto',
          borderRight: '2px solid #0f3460'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#ccc' }}>
              Payloads / Loads
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0f3460',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="active">Active</option>
                <option value="all">All</option>
                <option value="unassigned">Unassigned</option>
                <option value="assigned">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button 
                onClick={() => setShowAddPayload(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#e94560',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                + Add Payload
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredPayloads.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                backgroundColor: '#16213e',
                borderRadius: '8px'
              }}>
                No payloads found
              </div>
            ) : (
              filteredPayloads.map(payload => {
                const assignedTrucker = payload.assignedTrucker ? getTruckerById(payload.assignedTrucker) : null;
                const isCompleted = payload.status === 'completed';
                
                return (
                  <div
                    key={payload.id}
                    onClick={() => handlePayloadClick(payload)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, payload.id)}
                    style={{
                      backgroundColor: isCompleted ? '#1a2a1a' : '#16213e',
                      borderRadius: '10px',
                      padding: '16px',
                      border: `2px solid ${
                        draggedTrucker && !payload.assignedTrucker && !isCompleted
                          ? '#e94560' 
                          : isCompleted ? '#2d5a2d' : '#0f3460'
                      }`,
                      cursor: draggedTrucker && !payload.assignedTrucker && !isCompleted ? 'pointer' : 'default',
                      opacity: isCompleted ? 0.7 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          marginBottom: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            textDecoration: isCompleted ? 'line-through' : 'none'
                          }}>
                            {payload.description}
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: 
                              payload.status === 'completed' ? '#2d5a2d' :
                              payload.status === 'in-transit' ? '#5a4a2d' :
                              payload.status === 'assigned' ? '#0f3460' : '#3d1a1a',
                            color: 
                              payload.status === 'completed' ? '#7dce7d' :
                              payload.status === 'in-transit' ? '#ceae7d' :
                              payload.status === 'assigned' ? '#7dafce' : '#ce7d7d'
                          }}>
                            {payload.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(2, 1fr)', 
                          gap: '8px',
                          fontSize: '13px',
                          color: '#aaa'
                        }}>
                          <div>
                            <span style={{ color: '#666' }}>From: </span>
                            {payload.origin || 'N/A'}
                          </div>
                          <div>
                            <span style={{ color: '#666' }}>To: </span>
                            {payload.destination || 'N/A'}
                          </div>
                          <div>
                            <span style={{ color: '#666' }}>Pickup: </span>
                            {formatDate(payload.pickupDate)} {payload.pickupTime || ''}
                          </div>
                          <div>
                            <span style={{ color: '#666' }}>Deliver by: </span>
                            {formatDate(payload.deliveryDate)}
                          </div>
                        </div>

                        {assignedTrucker && (
                          <div style={{ 
                            marginTop: '12px',
                            padding: '10px',
                            backgroundColor: '#0f3460',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div>
                              <span style={{ color: '#666', fontSize: '12px' }}>Assigned: </span>
                              <span style={{ fontWeight: '600', color: '#7dafce' }}>
                                {assignedTrucker.name}
                              </span>
                              <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>
                                {assignedTrucker.truck}
                              </span>
                            </div>
                            {!isCompleted && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUnassign(payload.id); }}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  backgroundColor: '#3d1a1a',
                                  color: '#ce7d7d',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Unassign
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '12px' }}>
                        {!isCompleted && assignedTrucker && payload.status !== 'in-transit' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleInTransit(payload.id); }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: '#5a4a2d',
                              color: '#ceae7d',
                              cursor: 'pointer',
                              fontSize: '12px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🚚 In Transit
                          </button>
                        )}
                        {!isCompleted && assignedTrucker && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleComplete(payload.id); }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: '#2d5a2d',
                              color: '#7dce7d',
                              cursor: 'pointer',
                              fontSize: '12px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ✓ Complete
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingPayload(payload); }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#0f3460',
                            color: '#7dafce',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePayload(payload.id); }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#3d1a1a',
                            color: '#ce7d7d',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side - Truckers */}
        <div style={{ 
          flex: '0 0 35%', 
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: '#12192a'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#ccc' }}>
              Truckers
            </h2>
            <button 
              onClick={() => setShowAddTrucker(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#e94560',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              + Add Trucker
            </button>
          </div>

          <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
            Drag or click a trucker, then click a payload to assign
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {truckers.map(trucker => {
              const isAssigned = isTruckerAssigned(trucker.id);
              const assignment = getTruckerAssignment(trucker.id);
              const isSelected = draggedTrucker?.id === trucker.id;
              
              return (
                <div
                  key={trucker.id}
                  draggable={!isAssigned}
                  onDragStart={(e) => handleDragStart(e, trucker)}
                  onClick={() => handleTruckerClick(trucker)}
                  style={{
                    backgroundColor: '#16213e',
                    borderRadius: '8px',
                    padding: '14px',
                    borderLeft: `4px solid ${isAssigned ? '#ce7d7d' : '#7dce7d'}`,
                    cursor: isAssigned ? 'not-allowed' : 'grab',
                    opacity: isAssigned ? 0.8 : 1,
                    outline: isSelected ? '2px solid #e94560' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: isAssigned ? '#ce7d7d' : '#7dce7d'
                        }} />
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>
                          {trucker.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {trucker.truck}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {trucker.phone}
                      </div>
                      {assignment && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#ceae7d',
                          marginTop: '6px',
                          padding: '4px 8px',
                          backgroundColor: '#2a2a1a',
                          borderRadius: '4px'
                        }}>
                          → {assignment.destination}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingTrucker(trucker); }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#0f3460',
                          color: '#7dafce',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTrucker(trucker.id); }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#3d1a1a',
                          color: '#ce7d7d',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ 
            marginTop: '20px', 
            padding: '12px',
            backgroundColor: '#0f1520',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7dce7d' }} />
              <span style={{ color: '#7dce7d' }}>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ce7d7d' }} />
              <span style={{ color: '#ce7d7d' }}>Assigned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Trucker Modal */}
      {showAddTrucker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#16213e',
            padding: '24px',
            borderRadius: '12px',
            width: '360px'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#e94560' }}>Add New Trucker</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                placeholder="Name *"
                value={newTrucker.name}
                onChange={(e) => setNewTrucker(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #0f3460',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <input
                placeholder="Phone"
                value={newTrucker.phone}
                onChange={(e) => setNewTrucker(prev => ({ ...prev, phone: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #0f3460',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <input
                placeholder="Truck ID/Name"
                value={newTrucker.truck}
                onChange={(e) => setNewTrucker(prev => ({ ...prev, truck: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #0f3460',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowAddTrucker(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #0f3460',
                    backgroundColor: 'transparent',
                    color: '#aaa',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTrucker}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#e94560',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Add Trucker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payload Modal */}
      {showAddPayload && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#16213e',
            padding: '24px',
            borderRadius: '12px',
            width: '400px'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#e94560' }}>Add New Payload</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                placeholder="Description *"
                value={newPayload.description}
                onChange={(e) => setNewPayload(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #0f3460',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  placeholder="Origin"
                  value={newPayload.origin}
                  onChange={(e) => setNewPayload(prev => ({ ...prev, origin: e.target.value }))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #0f3460',
                    backgroundColor: '#1a1a2e',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
                <input
                  placeholder="Destination"
                  value={newPayload.destination}
                  onChange={(e) => setNewPayload(prev => ({ ...prev, destination: e.target.value }))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #0f3460',
                    backgroundColor: '#1a1a2e',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={newPayload.pickupDate}
                    onChange={(e) => setNewPayload(prev => ({ ...prev, pickupDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #0f3460',
                      backgroundColor: '#1a1a2e',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    value={newPayload.pickupTime}
                    onChange={(e) => setNewPayload(prev => ({ ...prev, pickupTime: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #0f3460',
                      backgroundColor: '#1a1a2e',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={newPayload.deliveryDate}
                  onChange={(e) => setNewPayload(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #0f3460',
                    backgroundColor: '#1a1a2e',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowAddPayload(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #0f3460',
                    backgroundColor: 'transparent',
                    color: '#aaa',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayload}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#e94560',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Add Payload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trucker Modal */}
      {editingTrucker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#16213e',
            padding: '24px',
            borderRadius: '12px',
            width: '360px'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#e94560' }}>Edit Trucker</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                placeholder="Name *"
                value={editingTrucker.name}
                onChange={(e) => setEditingTrucker(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #0f3460',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <input
                placeholder="Phone"
                value={editingTrucker.phone}
                onChange={(e) => setEditingTrucker(prev => ({ ...prev, phone: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #0f3460',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <input
                placeholder="Truck ID/Name"
                value={editingTrucker.truck}
                onChange={(e) => setEditingTrucker(prev => ({ ...prev, truck: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #0f3460',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => setEditingTrucker(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #0f3460',
                    backgroundColor: 'transparent',
                    color: '#aaa',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTrucker}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#e94560',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payload Modal */}
      {editingPayload && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#16213e',
            padding: '24px',
            borderRadius: '12px',
            width: '400px'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#e94560' }}>Edit Payload</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                placeholder="Description *"
                value={editingPayload.description}
                onChange={(e) => setEditingPayload(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #0f3460',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  placeholder="Origin"
                  value={editingPayload.origin}
                  onChange={(e) => setEditingPayload(prev => ({ ...prev, origin: e.target.value }))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #0f3460',
                    backgroundColor: '#1a1a2e',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
                <input
                  placeholder="Destination"
                  value={editingPayload.destination}
                  onChange={(e) => setEditingPayload(prev => ({ ...prev, destination: e.target.value }))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #0f3460',
                    backgroundColor: '#1a1a2e',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={editingPayload.pickupDate}
                    onChange={(e) => setEditingPayload(prev => ({ ...prev, pickupDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #0f3460',
                      backgroundColor: '#1a1a2e',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    value={editingPayload.pickupTime}
                    onChange={(e) => setEditingPayload(prev => ({ ...prev, pickupTime: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #0f3460',
                      backgroundColor: '#1a1a2e',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={editingPayload.deliveryDate}
                  onChange={(e) => setEditingPayload(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #0f3460',
                    backgroundColor: '#1a1a2e',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => setEditingPayload(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #0f3460',
                    backgroundColor: 'transparent',
                    color: '#aaa',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePayload}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#e94560',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
