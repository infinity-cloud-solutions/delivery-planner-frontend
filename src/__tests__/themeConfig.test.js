import '@testing-library/jest-dom';

import { SidebarContext, DriverSidebarContext } from 'contexts/SidebarContext';
import * as Icons from 'components/icons/Icons';
import { CardComponent } from 'theme/additions/card/card';
import { badgeStyles } from 'theme/components/badge';
import { buttonStyles } from 'theme/components/button';
import { inputStyles } from 'theme/components/input';
import { linkStyles } from 'theme/components/link';
import { progressStyles } from 'theme/components/progress';
import { sliderStyles } from 'theme/components/slider';
import { switchStyles } from 'theme/components/switch';
import { textareaStyles } from 'theme/components/textarea';
import { breakpoints } from 'theme/foundations/breakpoints';
import { globalStyles } from 'theme/styles';
import theme from 'theme/theme';
import {
	barChartDataConsumption,
	barChartDataDailyTraffic,
	barChartOptionsConsumption,
	barChartOptionsDailyTraffic,
	lineChartDataTotalSpent,
	lineChartOptionsTotalSpent,
	pieChartData,
	pieChartOptions
} from 'variables/charts';

const lightProps = { colorMode: 'light' };
const darkProps = { colorMode: 'dark' };

const invokeVariants = (variants) => {
	Object.values(variants).forEach((variant) => {
		expect(variant(lightProps)).toEqual(expect.any(Object));
		expect(variant(darkProps)).toEqual(expect.any(Object));
	});
};

describe('Theme and static configuration', () => {
	test('assembles the Chakra theme with the expected breakpoints and component keys', () => {
		expect(breakpoints.sm).toBe('320px');
		expect(breakpoints['2sm']).toBe('380px');
		expect(breakpoints['3xl']).toBe('1920px');
		expect(theme.breakpoints.xl).toBe('1200px');
		expect(theme.components.Button).toBeDefined();
		expect(theme.components.Badge).toBeDefined();
		expect(theme.components.Card).toBeDefined();
	});

	test('resolves global styles and every exported component variant in light and dark mode', () => {
		expect(globalStyles.styles.global(lightProps).body.bg).toBe('secondaryGray.300');
		expect(globalStyles.styles.global(darkProps).body.bg).toBe('navy.900');
		expect(globalStyles.styles.global(lightProps).html.fontFamily).toBe('DM Sans');
		expect(CardComponent.components.Card.baseStyle(lightProps).bg).toBe('#ffffff');
		expect(CardComponent.components.Card.baseStyle(darkProps).bg).toBe('navy.800');
		expect(linkStyles.components.Link.baseStyle._hover.border).toBe('none');
		invokeVariants(buttonStyles.components.Button.variants);
		invokeVariants(badgeStyles.components.Badge.variants);
		invokeVariants(inputStyles.components.Input.variants);
		invokeVariants(inputStyles.components.NumberInput.variants);
		invokeVariants(inputStyles.components.Select.variants);
		invokeVariants(textareaStyles.components.Textarea.variants);
		invokeVariants(progressStyles.components.Progress.variants);
		invokeVariants(sliderStyles.components.RangeSlider.variants);
		invokeVariants(switchStyles.components.Switch.variants);
	});

	test('exports chart datasets, contexts, and icon factories', () => {
		expect(barChartDataDailyTraffic[0].data).toEqual([ 20, 30, 40, 20, 45, 50, 30 ]);
		expect(barChartOptionsDailyTraffic.xaxis.categories).toContain('18');
		expect(barChartDataConsumption).toHaveLength(3);
		expect(barChartOptionsConsumption.chart.stacked).toBe(true);
		expect(pieChartOptions.colors).toEqual([ '#4318FF', '#6AD2FF', '#EFF4FB' ]);
		expect(pieChartData).toEqual([ 63, 25, 12 ]);
		expect(lineChartDataTotalSpent[1].name).toBe('Profit');
		expect(lineChartOptionsTotalSpent.chart.dropShadow.enabled).toBe(true);
		expect(lineChartOptionsTotalSpent.xaxis.categories).toEqual([ 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB' ]);
		expect(SidebarContext).toBeDefined();
		expect(DriverSidebarContext).toBeDefined();
		expect(Icons.AdobexdLogo).toBeDefined();
		expect(Icons.DashboardLogo).toBeDefined();
		expect(Icons.DashboardLogoWhite).toBeDefined();
		expect(Icons.DocumentIcon).toBeDefined();
		expect(Icons.GlobeIcon).toBeDefined();
	});
});