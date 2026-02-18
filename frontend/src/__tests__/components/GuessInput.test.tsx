import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GuessInput from '../../components/GuessInput';

describe('GuessInput', () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  it('renders the text input', () => {
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);
    expect(screen.getByPlaceholderText('Enter celebrity name...')).toBeTruthy();
  });

  it('renders a custom placeholder', () => {
    render(
      <GuessInput
        onSubmit={onSubmit}
        disabled={false}
        placeholder="Come back tomorrow!"
      />
    );
    expect(screen.getByPlaceholderText('Come back tomorrow!')).toBeTruthy();
  });

  it('renders the Guess button', () => {
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);
    expect(screen.getByText('Guess')).toBeTruthy();
  });

  it('calls onSubmit with the typed text when button is pressed', () => {
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Tom Hanks');
    fireEvent.press(screen.getByText('Guess'));

    expect(onSubmit).toHaveBeenCalledWith('Tom Hanks');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('trims whitespace from the submitted guess', () => {
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), '  Brad Pitt  ');
    fireEvent.press(screen.getByText('Guess'));

    expect(onSubmit).toHaveBeenCalledWith('Brad Pitt');
  });

  it('does not call onSubmit when the input is empty', () => {
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.press(screen.getByText('Guess'));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit when the input contains only whitespace', () => {
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), '   ');
    fireEvent.press(screen.getByText('Guess'));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the input after a successful submission', () => {
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByPlaceholderText('Enter celebrity name...');
    fireEvent.changeText(input, 'Meryl Streep');
    fireEvent.press(screen.getByText('Guess'));

    expect(input.props.value).toBe('');
  });

  it('disables the input and button when disabled prop is true', () => {
    render(<GuessInput onSubmit={onSubmit} disabled={true} />);

    const input = screen.getByPlaceholderText('Enter celebrity name...');
    expect(input.props.editable).toBe(false);
  });

  it('does not call onSubmit when disabled, even with text', () => {
    render(<GuessInput onSubmit={onSubmit} disabled={true} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Cate Blanchett');
    fireEvent.press(screen.getByText('Guess'));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits when the return key is pressed', () => {
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Denzel Washington');
    fireEvent(screen.getByPlaceholderText('Enter celebrity name...'), 'submitEditing');

    expect(onSubmit).toHaveBeenCalledWith('Denzel Washington');
  });
});
