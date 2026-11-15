# PROJECT VIVA, PRESENTATION & DEFENSE NOTES

This document provides concise technical explanations, architectural summaries, and anticipated viva-voce questions and answers for project evaluations and technical presentations.

---

## 1. 2-Minute Project Elevator Pitch

> *"The **Smart Agriculture Assistant** is an integrated full-stack agricultural platform designed to address the dual challenges of crop yield loss from foliar diseases and revenue loss from intermediary exploitation.*
>
> *On the technical AI front, we deploy a 100-tree Random Forest classifier predicting optimal crop suitability across 22 classes using soil and climate data. For disease diagnosis, instead of a vulnerable single-model setup, we built a 6-stage vision pipeline featuring image quality gating, 34-crop classification, health filtering, and a dual neural ensemble of EfficientNet-B3 and ConvNeXt-Tiny across 116 disease classes. We solve the deep learning 'overconfidence' problem by integrating Platt temperature calibration and a 768-dimensional FAISS index with 42,652 embeddings to reject out-of-distribution images, achieving 94.96% selective accuracy.*
>
> *On the full-stack software front, we developed a direct farmer-to-consumer marketplace using the MERN stack. It features atomic inventory reservations to prevent overselling, multi-farmer checkout splitting where a single order automatically routes suborders to distinct producers, simulated payment screenshot verification, and an auditable P&L financial ledger that tracks cultivation costs against delivered sales in real time."*

---

## 2. Anticipated Reviewer & Viva Questions

### Q1: Why did you use an ensemble of EfficientNet-B3 and ConvNeXt-Tiny instead of a single ResNet-50?
**Answer**: ResNet-50 relies on standard $3 \times 3$ convolutions and often struggles with multi-scale leaf lesions. EfficientNet-B3 uses compound scaling with Mobile Inverted Bottlenecks (MBConv) and Squeeze-and-Excitation blocks, while ConvNeXt-Tiny is a modernized pure convolutional network utilizing $7 \times 7$ depthwise convolutions and LayerNorm. Combining these distinct architectural inductive biases yielded an inter-model agreement rate of $87.06\%$ and higher selective accuracy ($94.96\%$) than either single model.

### Q2: What is the purpose of Temperature Scaling? Why is Softmax alone not enough?
**Answer**: Standard deep networks trained with cross-entropy are notoriously overconfident; a model might predict a disease with $99\%$ confidence even when wrong. Platt temperature scaling divides logits by an empirical temperature parameter ($T > 1$ softens probabilities, $T < 1$ sharpens them) without altering classification accuracy. For our ConvNeXt model, scaling with $T = 1.5364$ reduced the Expected Calibration Error (ECE) from $8.74\%$ down to $4.44\%$, ensuring that a confidence score of $0.85$ actually corresponds to an $85\%$ true accuracy probability.

### Q3: How does your Out-of-Distribution (OOD) detection work?
**Answer**: When a farmer uploads an image that is completely unrelated to plant pathology (e.g., a photo of a shoe or a human face), standard neural networks will still assign it to one of the 116 disease classes. To prevent this, we extract a 768-dimensional embedding from ConvNeXt-Tiny and query a FAISS vector index of $42,652$ reference images. If the maximum cosine similarity is below our empirical threshold ($0.5783$) or the top-10 neighbors do not agree on the crop species, the system rejects the prediction with an `uncertain` or `rejected` status.

### Q4: How does the application prevent overselling when multiple consumers buy the same produce simultaneously?
**Answer**: We implement atomic conditional queries in MongoDB via Mongoose:
```javascript
Product.findOneAndUpdate(
  { _id: productId, stock: { $gte: requestedQty }, status: 'active' },
  { $inc: { stock: -requestedQty } },
  { new: true }
);
```
Because MongoDB guarantees document-level atomicity on single operations, only the first request finding $\text{stock} \ge \text{quantity}$ succeeds. Any concurrent request finding insufficient stock immediately fails without decrementing, and any partially completed items in the checkout undergo an automated compensating rollback.

### Q5: How is multi-farmer checkout handled when a consumer purchases from 3 different farmers in one cart?
**Answer**: The backend creates a single master `CheckoutOrder` representing the customer's payment and delivery destination, and then partitions the items by producer to create 3 independent `FarmerSuborder` records. Each suborder has its own independent payment status, fulfillment lifecycle, and payment proof review. Farmer A dispatching or rejecting their items has zero effect on Farmer B's or Farmer C's orders.

### Q6: How do you calculate Net Profit in the farmer dashboard?
**Answer**: We enforce an explicit accounting policy based on recognized revenue:
$$\text{Estimated Net Profit} = \sum (\text{Delivered Orders}) - \sum (\text{Recorded Cultivation Expenses})$$
Pending, dispatched, or cancelled orders are tracked separately and are never counted as completed cash revenue until marked `DELIVERED`. Input costs are tracked across 11 agricultural categories (seeds, fertilizers, labour, irrigation, etc.).

