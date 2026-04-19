import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MdAccessTime, MdCheckCircle } from 'react-icons/md';

import Card from '../card/Card';
import FooterAdmin from '../footer/FooterAdmin';
import FooterAuth from '../footer/FooterAuth';
import { HSeparator, VSeparator } from '../separator/Separator';
import IconBox from '../icons/IconBox';
import InputField from '../fields/InputField';
import { ItemContent } from '../menu/ItemContent';
import Mastercard from '../card/Mastercard';
import Member from '../card/Member';
import MiniStatistics from '../card/MiniStatistics';
import NFT from '../card/NFT';
import SwitchField from '../fields/SwitchField';
import TimelineRow from '../dataDispaly/TimelineRow';
import TransparentMenu from '../menu/TransparentMenu';
import theme from 'theme/theme';

const renderInTheme = (ui) => {
	return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
};

describe('Low-logic UI primitives', () => {
	test('renders the card, mastercard, member, and footer wrappers', async () => {
		renderInTheme(
			<>
				<Card>Card body</Card>
				<Mastercard number='4242 4242 4242 4242' exp='12/30' cvv='321' />
				<Member avatar='avatar.png' name='Marco Burgos' job='Driver' />
				<FooterAdmin />
				<FooterAuth />
			</>
		);

		expect(screen.getByText('Card body')).toBeInTheDocument();
		expect(screen.getByText('4242 4242 4242 4242')).toBeInTheDocument();
		expect(screen.getByText('VALID THRU')).toBeInTheDocument();
		expect(screen.getByText('CVV')).toBeInTheDocument();
		expect(screen.getByText('Marco Burgos')).toBeInTheDocument();
		expect(screen.getByText('Driver')).toBeInTheDocument();
		expect(screen.getAllByText(/HiBerry. Derechos reservados/)).toHaveLength(2);
	});

	test('renders item content, icon boxes, and separators', () => {
		renderInTheme(
			<>
				<IconBox icon={<MdCheckCircle data-testid='icon-inside-box' />} data-testid='icon-box' />
				<ItemContent info='Schedule updated' />
				<HSeparator data-testid='horizontal-separator' />
				<VSeparator data-testid='vertical-separator' />
			</>
		);

		expect(screen.getByTestId('icon-box')).toContainElement(screen.getByTestId('icon-inside-box'));
		expect(screen.getByText('New Update: Schedule updated')).toBeInTheDocument();
		expect(screen.getByText('A new update for your downloaded item is available!')).toBeInTheDocument();
		expect(screen.getByTestId('horizontal-separator')).toBeInTheDocument();
		expect(screen.getByTestId('vertical-separator')).toBeInTheDocument();
	});

	test('renders mini statistics with and without a growth indicator', () => {
		const { rerender } = renderInTheme(
			<MiniStatistics
				startContent={<span>start</span>}
				endContent={<span>end</span>}
				name='Orders'
				growth='+12%'
				value='42'
			/>
		);

		expect(screen.getByText('Orders')).toBeInTheDocument();
		expect(screen.getByText('42')).toBeInTheDocument();
		expect(screen.getByText('+12%')).toBeInTheDocument();
		expect(screen.getByText('since last month')).toBeInTheDocument();

		rerender(
			<ChakraProvider theme={theme}>
				<MiniStatistics name='Revenue' value='15' />
			</ChakraProvider>
		);

		expect(screen.getByText('Revenue')).toBeInTheDocument();
		expect(screen.queryByText('since last month')).not.toBeInTheDocument();
	});

	test('renders nft cards and toggles the like button state', () => {
		renderInTheme(
			<NFT
				image='https://example.com/card.png'
				name='Berry Box'
				author='HiBerry'
				bidders={[ 'one.png', 'two.png' ]}
				download='https://example.com/bid'
				currentbid='$120'
			/>
		);

		expect(screen.getByText('Berry Box')).toBeInTheDocument();
		expect(screen.getByText('HiBerry')).toBeInTheDocument();
		expect(screen.getByText('Current Bid: $120')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Place Bid' })).toHaveAttribute('href', 'https://example.com/bid');

		const likeButton = screen.getAllByRole('button')[0];
		const initialMarkup = likeButton.innerHTML;

		fireEvent.click(likeButton);

		expect(likeButton.innerHTML).not.toBe(initialMarkup);
	});

	test('renders input fields with default and custom spacing', () => {
		renderInTheme(
			<>
				<InputField
					id='email'
					label='Email'
					extra='required'
					placeholder='email@example.com'
					type='email'
				/>
				<InputField
					id='phone'
					label='Phone'
					placeholder='555-0000'
					type='tel'
					mb='10px'
				/>
			</>
		);

		expect(screen.getByLabelText('Emailrequired')).toHaveAttribute('placeholder', 'email@example.com');
		expect(screen.getByLabelText('Phone')).toHaveAttribute('placeholder', '555-0000');
	});

	test('handles the reversed switch field branch with internal state and the standard branch with an external handler', () => {
		const standardOnChange = jest.fn();
		const { rerender } = renderInTheme(
			<SwitchField
				id='reversed-switch'
				label='Reverse'
				desc='Internal state'
				reversed
				isChecked
				textWidth='60%'
				fontSize='xs'
			/>
		);

		const reversedSwitch = screen.getByRole('checkbox');
		expect(reversedSwitch).toBeChecked();

		fireEvent.click(reversedSwitch);

		expect(reversedSwitch).not.toBeChecked();

		rerender(
			<ChakraProvider theme={theme}>
				<SwitchField id='reversed-unchecked' label='Reverse Off' desc='Unchecked' reversed isChecked={false} />
			</ChakraProvider>
		);

		expect(screen.getByRole('checkbox')).not.toBeChecked();

		rerender(
			<ChakraProvider theme={theme}>
				<SwitchField
					id='standard-switch'
					label='Standard'
					desc='External state'
					isChecked
					onChange={standardOnChange}
					textWidth='90%'
					fontSize='sm'
				/>
			</ChakraProvider>
		);

		fireEvent.click(screen.getByRole('checkbox'));
		expect(standardOnChange).toHaveBeenCalledTimes(1);

		rerender(
			<ChakraProvider theme={theme}>
				<SwitchField id='standard-unchecked' label='Standard Off' desc='No handler' isChecked={false} />
			</ChakraProvider>
		);

		expect(screen.getByRole('checkbox')).not.toBeChecked();
	});

	test('renders timeline rows for both ltr and rtl document directions', () => {
		document.documentElement.dir = 'ltr';

		const { rerender } = renderInTheme(
			<TimelineRow logo={MdAccessTime} title='Scheduled' date='2026-04-18' color='green.500' index={0} arrLength={2} />
		);

		expect(screen.getByText('Scheduled')).toBeInTheDocument();
		expect(screen.getByText('2026-04-18')).toBeInTheDocument();

		document.documentElement.dir = 'rtl';

		rerender(
			<ChakraProvider theme={theme}>
				<TimelineRow logo={MdCheckCircle} title='Delivered' date='2026-04-19' color='blue.500' index={1} arrLength={2} />
			</ChakraProvider>
		);

		expect(screen.getByText('Delivered')).toBeInTheDocument();
		expect(screen.getByText('2026-04-19')).toBeInTheDocument();
		document.documentElement.dir = 'ltr';
	});

	test('opens the transparent menu and shows all available panels', async () => {
		renderInTheme(<TransparentMenu icon={<span>open menu</span>} />);

		fireEvent.click(screen.getByRole('button'));

		expect(await screen.findByText('Panel 1')).toBeInTheDocument();
		expect(screen.getByText('Panel 2')).toBeInTheDocument();
		expect(screen.getByText('Panel 3')).toBeInTheDocument();
		expect(screen.getByText('Panel 4')).toBeInTheDocument();
	});
});