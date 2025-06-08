using InvestorCodex.Api.Models;

namespace InvestorCodex.Api.Data;

public interface IContactRepository
{
    Task<PaginatedResponse<Contact>> GetContactsAsync(
        int page,
        int pageSize,
        string? search = null,
        Guid? companyId = null,
        string[]? personas = null);
    
    Task<Contact?> GetContactByIdAsync(Guid id);
    Task<Contact> CreateContactAsync(Contact contact);
    Task<Contact?> UpdateContactAsync(Guid id, Contact contact);
    Task<bool> DeleteContactAsync(Guid id);
}
