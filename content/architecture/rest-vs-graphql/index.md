+++
title = "REST vs GraphQL"
description = "So sánh hai kiến trúc API phổ biến: REST và GraphQL"
weight = 1
+++

## 1. Định nghĩa

### REST
REST (Representational State Transfer) là kiến trúc API dựa trên tài nguyên và HTTP verbs.

### GraphQL
GraphQL là query language cho API, cho phép client chỉ định chính xác dữ liệu cần lấy.

---

## 2. Cách thiết kế API

| Tiêu chí | REST | GraphQL |
|--------|------|---------|
| Endpoint | Nhiều endpoint | 1 endpoint |
| Data shape | Server quyết định | Client quyết định |
| Over-fetch | Có thể xảy ra | Hạn chế |
| Under-fetch | Có thể xảy ra | Hạn chế |

---

## 3. Hiệu năng

- REST: Đơn giản, cache HTTP tốt
- GraphQL: Linh hoạt, nhưng cần tối ưu resolver

---

## 4. Versioning

- REST: `/v1`, `/v2`
- GraphQL: Không khuyến khích versioning, dùng schema evolution

---

## 5. Bảo mật

- REST: Dựa trên HTTP middleware
- GraphQL: Cần kiểm soát depth, complexity query

---

## 6. Khi nào nên dùng

### REST
- API đơn giản
- Hệ thống nhỏ đến trung bình
- Cần cache HTTP

### GraphQL
- Frontend phức tạp
- Nhiều client (web, mobile)
- Dữ liệu quan hệ phức tạp

---

## 7. Kết luận kỹ thuật

Không có kiến trúc “tốt hơn tuyệt đối”. Lựa chọn phụ thuộc vào:
- Quy mô hệ thống
- Độ phức tạp dữ liệu
- Năng lực đội ngũ
