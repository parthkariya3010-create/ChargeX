import 'package:flutter_test/flutter_test.dart';
import 'package:chargex_mobile/main.dart';

void main() {
  testWidgets('App renders without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(const ChargeXApp());
    expect(find.byType(ChargeXApp), findsOneWidget);
  });
}
