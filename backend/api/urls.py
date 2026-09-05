from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/me/', views.current_user_view, name='current_user'),

    # Tenders
    path('tenders/', views.tender_list_create, name='tender_list_create'),
    path('tenders/<uuid:pk>/', views.tender_detail, name='tender_detail'),
    path('tenders/<uuid:pk>/requirements/', views.tender_requirements, name='tender_requirements'),
    path('tenders/<uuid:pk>/extract-requirements/', views.extract_tender_requirements, name='extract_tender_requirements'),

    # Bidders
    path('bidders/', views.bidder_list_create, name='bidder_list_create'),
    path('bidders/<uuid:pk>/', views.bidder_detail, name='bidder_detail'),

    # Bids
    path('bids/', views.bid_list_create, name='bid_list_create'),
    path('bids/<uuid:pk>/', views.bid_detail, name='bid_detail'),

    # Documents
    path('documents/upload/', views.document_upload, name='document_upload'),
    path('documents/<uuid:pk>/', views.document_detail, name='document_detail'),

    # Verification
    path('verification/', views.trigger_verification, name='trigger_verification'),

    # Compliance
    path('compliance/evaluate/', views.evaluate_compliance, name='evaluate_compliance'),

    # Risk
    path('risk/calculate/', views.calculate_risk, name='calculate_risk'),

    # AI Recommendation & Decision
    path('bids/<uuid:pk>/recommendation/', views.generate_recommendation, name='generate_recommendation'),
    path('bids/<uuid:pk>/decision/', views.record_decision, name='record_decision'),

    # Audit & Dashboard
    path('bids/<uuid:pk>/audit/', views.bid_audit_trail, name='bid_audit_trail'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
]
