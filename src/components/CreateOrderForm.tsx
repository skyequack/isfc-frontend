import { useState } from 'react';
import { ItemCategory, OrderStatus } from '@/types/enums';
import { CreateOrderRequest, CreateOrderItem } from '@/types/order';

export default function CreateOrderForm() {
  const [formData, setFormData] = useState<CreateOrderRequest>({
    customerId: '',
    event: '',
    date: new Date(),
    time: '',
    guests: 0,
    status: OrderStatus.PENDING,
    total: 0,
    requirements: [],
    items: []
  });

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [item, setItem] = useState<CreateOrderItem>({
    name: '',
    quantity: 0,
    price: 0,
    category: ItemCategory.FOOD // Default to FOOD
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      setSuccess(`Order created successfully! Order ID: ${result.order.id}`);
      
      // Reset form
      setFormData({
        customerId: '',
        event: '',
        date: new Date(),
        time: '',
        guests: 0,
        status: OrderStatus.PENDING,
        total: 0,
        requirements: [],
        items: []
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create order');
    }
  };

  const addItem = () => {
    setFormData(prev => {
      const updatedItems = [...prev.items, item];
      const newTotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      return {
        ...prev,
        items: updatedItems,
        total: newTotal
      };
    });
    // Reset item form
    setItem({
      name: '',
      quantity: 0,
      price: 0,
      category: ItemCategory.FOOD
    });
  };

  return (
    <div>
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer ID */}
      <div>
        <label>Customer ID</label>
        <input
          type="text"
          value={formData.customerId}
          onChange={e => setFormData({...formData, customerId: e.target.value})}
          required
        />
      </div>

      {/* Event Details */}
      <div>
        <label>Event Name</label>
        <input
          type="text"
          value={formData.event}
          onChange={e => setFormData({...formData, event: e.target.value})}
          required
        />
      </div>

      {/* Date and Time */}
      <div>
        <label>Event Date</label>
        <input
          type="date"
          value={formData.date.toISOString().split('T')[0]}
          onChange={e => setFormData({...formData, date: new Date(e.target.value)})}
          required
        />
      </div>

      <div>
        <label>Event Time</label>
        <input
          type="time"
          value={formData.time}
          onChange={e => setFormData({...formData, time: e.target.value})}
          required
        />
      </div>

      {/* Guests */}
      <div>
        <label>Number of Guests</label>
        <input
          type="number"
          value={formData.guests}
          onChange={e => setFormData({...formData, guests: Number(e.target.value)})}
          required
        />
      </div>

      {/* Add Item Section */}
      <div className="border p-4 rounded">
        <h3>Add Item</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Item name"
            value={item.name}
            onChange={e => setItem({...item, name: e.target.value})}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={item.quantity}
            onChange={e => setItem({...item, quantity: Number(e.target.value)})}
          />
          <input
            type="number"
            placeholder="Price"
            value={item.price}
            onChange={e => setItem({...item, price: Number(e.target.value)})}
          />
          <select
            value={item.category}
            onChange={e => setItem({...item, category: e.target.value as ItemCategory})}
          >
            {Object.values(ItemCategory).map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button type="button" onClick={addItem}>
            Add Item
          </button>
        </div>
      </div>

      {/* Display added items */}
      <div>
        <h3>Items</h3>
        <ul>
          {formData.items.map((item, index) => (
            <li key={index}>
              {item.name} - {item.quantity} x ${item.price} - {item.category}
            </li>
          ))}
        </ul>
        <div className="mt-4 font-bold">
          Total: ${formData.total.toFixed(2)}
        </div>
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Create Order
      </button>
    </form>
    </div>
  );
}
