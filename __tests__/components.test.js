import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button, Choices, Field, Empty } from '../src/components/UI';
import { ReminderCard } from '../src/components/ReminderCard';
test('button invokes action and exposes accessible label',async()=>{
  const action=jest.fn();const screen=await render(<Button title="Save vehicle" onPress={action} />);
  await fireEvent.press(screen.getByRole('button',{name:'Save vehicle'}));expect(action).toHaveBeenCalledTimes(1);
});
test('disabled save cannot be activated',async()=>{
  const action=jest.fn();const screen=await render(<Button title="Saving" disabled onPress={action} />);
  await fireEvent.press(screen.getByRole('button',{name:'Saving'}));expect(action).not.toHaveBeenCalled();
});
test('field forwards text input',async()=>{
  const change=jest.fn();const screen=await render(<Field label="Make" value="" onChangeText={change} />);
  await fireEvent.changeText(screen.getByLabelText('Make'),'Toyota');expect(change).toHaveBeenCalledWith('Toyota');
});
test('filter selection forwards selected value',async()=>{
  const change=jest.fn();const screen=await render(<Choices label="Sort" options={['Newest','Oldest']} value="Newest" onChange={change} />);
  await fireEvent.press(screen.getByRole('button',{name:'Sort: Oldest'}));expect(change).toHaveBeenCalledWith('Oldest');
});
test('empty states provide useful guidance',async()=>{const screen=await render(<Empty title="No vehicles" message="Add a vehicle to start." />);expect(screen.getByText('Add a vehicle to start.')).toBeTruthy();});
test('completed reminders show completion even with overdue targets',async()=>{
  const screen=await render(<ReminderCard reminder={{title:'Oil',registration_no:'CAA-1234',due_date:'2020-01-01',current_mileage:100,status:'completed'}} />);
  expect(screen.getByText('Completed')).toBeTruthy();
});

jest.mock('../src/hooks/useApp',()=>({useApp:jest.fn()}));
jest.mock('expo-router',()=>({router:{push:jest.fn()}}));
import { useApp } from '../src/hooks/useApp';
import { RecordsScreen } from '../src/components/RecordsScreen';
test('service history filters by type and vehicle and searches workshop',async()=>{
  useApp.mockReturnValue({vehicles:[{id:1,registration_no:'AAA-001',make:'Toyota'},{id:2,registration_no:'BBB-002',make:'Honda'}],services:[
    {id:1,vehicle_id:1,registration_no:'AAA-001',service_type:'Engine Oil',service_date:'2026-10-01',mileage:100,cost:100,workshop:'Colombo'},
    {id:2,vehicle_id:2,registration_no:'BBB-002',service_type:'Repairs',service_date:'2026-10-02',mileage:200,cost:200,workshop:'Galle'},
  ],fuel:[],mutate:jest.fn()});
  const screen=await render(<RecordsScreen type="services" />);
  await fireEvent.press(screen.getByRole('button',{name:'Service category: Repairs'}));
  expect(screen.queryByText('Colombo',{exact:false})).toBeNull();expect(screen.getByText('Galle',{exact:false})).toBeTruthy();
  await fireEvent.press(screen.getByRole('button',{name:'Service category: All types'}));
  await fireEvent.press(screen.getByRole('button',{name:'Vehicle: AAA-001 · Toyota'}));
  expect(screen.queryByText('Galle',{exact:false})).toBeNull();
  await fireEvent.changeText(screen.getByLabelText('Search'),'absent');expect(screen.getByText('No records to show')).toBeTruthy();
});
