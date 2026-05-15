/**
 * framer-motion must be mocked before any Chakra UI import because Chakra's
 * Collapse/AccordionPanel uses motion.div + AnimatePresence. In jsdom,
 * framer-motion animations never complete, leaving collapsed panels with
 * display:none. The mock replaces motion elements with plain divs so the
 * AccordionPanel content is always accessible to RTL queries.
 */
jest.mock('framer-motion', () => {
  const React = require('react');
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
    motion: new Proxy({} as any, {
      get(_: any, tag: string) {
        return React.forwardRef(({ children, animate, initial, exit, variants, custom, transition, style, ...rest }: any, ref: any) =>
          React.createElement(tag, { ...rest, ref, style }, children)
        );
      },
    }),
    useAnimation: () => ({ start: jest.fn(), stop: jest.fn() }),
    useMotionValue: (val: any) => ({ get: () => val, set: jest.fn(), onChange: jest.fn() }),
    useTransform: () => ({ get: jest.fn() }),
    useReducedMotion: () => false,
    useAnimationControls: () => ({ start: jest.fn(), stop: jest.fn() }),
    useSpring: (val: any) => ({ get: () => val, set: jest.fn() }),
    useVelocity: () => ({ get: jest.fn() }),
    useScroll: () => ({ scrollX: {}, scrollY: {}, scrollXProgress: {}, scrollYProgress: {} }),
    MotionConfig: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ScheduleButton from '../ScheduleButton';

function renderButton(overrides: Partial<React.ComponentProps<typeof ScheduleButton>> = {}) {
  const defaults: React.ComponentProps<typeof ScheduleButton> = {
    isToday: true,
    isDisabled: false,
    isScheduling: false,
    availableDriverIds: [1, 2, 3],
    selectedAvailableDrivers: [1, 2, 3],
    onDriverChange: jest.fn(),
    onSchedule: jest.fn(),
  };
  return render(
    <ChakraProvider>
      <ScheduleButton {...defaults} {...overrides} />
    </ChakraProvider>
  );
}

describe('ScheduleButton', () => {
  it('renders nothing when isToday is false', () => {
    renderButton({ isToday: false });
    expect(screen.queryByRole('button', { name: /crear ruta/i })).toBeNull();
    expect(screen.queryByText(/ver opciones/i)).toBeNull();
  });

  it('renders the schedule button when isToday is true', () => {
    renderButton();
    expect(screen.getByRole('button', { name: /crear ruta sugerida/i })).toBeTruthy();
  });

  it('shows "Crear ruta sugerida" when all drivers are selected', () => {
    renderButton({ selectedAvailableDrivers: [1, 2, 3], availableDriverIds: [1, 2, 3] });
    const btn = screen.getByRole('button', { name: 'Crear ruta sugerida' });
    expect(btn).toBeTruthy();
  });

  it('shows single-driver label when only one driver is selected', () => {
    renderButton({ selectedAvailableDrivers: [2], availableDriverIds: [1, 2, 3] });
    expect(
      screen.getByRole('button', { name: 'Crear ruta sugerida usando repartidor 2' })
    ).toBeTruthy();
  });

  it('adapts label threshold to the total number of available drivers', () => {
    // With 2-driver config, both selected → "Crear ruta sugerida" (not "usando repartidor")
    renderButton({ selectedAvailableDrivers: [1, 2], availableDriverIds: [1, 2] });
    expect(screen.getByRole('button', { name: 'Crear ruta sugerida' })).toBeTruthy();
  });

  it('disables the schedule button when isDisabled is true', () => {
    renderButton({ isDisabled: true });
    const btn = screen.getByRole('button', { name: /crear ruta/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables the schedule button when isScheduling is true', () => {
    renderButton({ isScheduling: true });
    const btn = screen.getByRole('button', { name: /crear ruta/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('hides the advanced options accordion when isDisabled is true', () => {
    renderButton({ isDisabled: true });
    expect(screen.queryByText(/ver opciones avanzadas/i)).toBeNull();
  });

  it('renders the advanced options accordion when isDisabled is false', () => {
    renderButton({ isDisabled: false });
    expect(screen.getByText(/ver opciones avanzadas/i)).toBeTruthy();
  });

  it('renders all driver options from availableDriverIds in the advanced panel', () => {
    renderButton({ availableDriverIds: [1, 2, 3] });

    // Open the accordion to render the panel content
    fireEvent.click(screen.getByRole('button', { name: /ver opciones avanzadas/i }));

    const options = screen.getAllByRole('option');
    const labels = options.map((o) => o.textContent);
    expect(labels).toContain('Repartidor 1');
    expect(labels).toContain('Repartidor 2');
    expect(labels).toContain('Repartidor 3');
  });

  it('does not render a Repartidor 3 option when availableDriverIds has only 2 entries', () => {
    renderButton({ availableDriverIds: [1, 2] });

    fireEvent.click(screen.getByRole('button', { name: /ver opciones avanzadas/i }));

    const options = screen.getAllByRole('option');
    const labels = options.map((o) => o.textContent);
    expect(labels).toContain('Repartidor 1');
    expect(labels).toContain('Repartidor 2');
    expect(labels).not.toContain('Repartidor 3');
  });

  it('calls onSchedule when the schedule button is clicked', () => {
    const onSchedule = jest.fn();
    renderButton({ onSchedule });
    fireEvent.click(screen.getByRole('button', { name: /crear ruta sugerida/i }));
    expect(onSchedule).toHaveBeenCalledTimes(1);
  });

  it('calls onDriverChange when a driver option is selected in the advanced panel', () => {
    const onDriverChange = jest.fn();
    renderButton({ onDriverChange });

    fireEvent.click(screen.getByRole('button', { name: /ver opciones avanzadas/i }));

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    expect(onDriverChange).toHaveBeenCalledTimes(1);
  });
});
