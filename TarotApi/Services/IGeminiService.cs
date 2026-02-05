using System.Threading.Tasks;
using TarotApi.Models;

namespace TarotApi.Services;

public interface IGeminiService
{
    Task<string> GetReadingAsync(string userQuestion, List<TarotCard> cards);
}
