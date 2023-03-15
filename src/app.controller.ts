import { Controller, Get, Post } from '@nestjs/common';

@Controller("api")
export class AppController {
  private stripe;

  constructor() {
    this.stripe = require("stripe")("sk_test_51MlrevGxkAEWJXFvFvAmwavTSDcChcWBylcFnieVbF2BLfZmd9qi1TYCUnFxH11ct14ODPKmfDmIrc9o7Kt0aenk00zjSjJ7Ld");
  }

  @Get("connection_token")
  async ConnectionToken() {
    const connectionToken = await this.stripe.terminal.connectionTokens.create();
    return { secret: connectionToken.secret }
  }

  @Post("create_location")
  async CreateLocation() {
    const location = await this.stripe.terminal.locations.create({
      display_name: 'HQ',
      address: {
        line1: '1272 Valencia Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        postal_code: '94110',
      }
    });

    return location;
  }

  @Post("register_reader")
  async RegisterReader(req) {
    const reader = await this.stripe.terminal.readers.create({
      registration_code: 'simulated-wpe',
      location: req.body.location_id,
    });

    return reader;
  }

  @Post("create_payment_intent")
  // For Terminal payments, the 'payment_method_types' parameter must include
  // 'card_present'.
  // To automatically capture funds when a charge is authorized,
  // set `capture_method` to `automatic`.
  async CreatePaymentIntent(req) {
    const intent = await this.stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
      payment_method_types: [
        'card_present',
      ],
      capture_method: 'manual',
    });

    return intent;
  }

  @Post("process_payment")
  async ProcessPayment(req) {
    const reader = await this.stripe.terminal.readers.processPaymentIntent(req.body.reader_id, {
      payment_intent: req.body.payment_intent_id
    });

    return reader;
  }

  @Post("simulate_payment")
  async SimulatePayment(req) {
    const reader = await this.stripe.testHelpers.terminal.readers.presentPaymentMethod(req.body.reader_id);

    return reader;
  }

  @Post("capture_payment_intent")
  async CapturePaymentIntent(req) {
    const intent = await this.stripe.paymentIntents.capture(req.body.payment_intent_id);
    return intent;
  }
}
